// 67_pose_detector.js
// Uses MediaPipe Face Mesh for mouth open detection (lip landmarks)
// Uses MoveNet for hand spread detection
// No skeleton lines drawn on screen

const video = document.getElementById('video');
const canvas = document.getElementById('output');
const ctx = canvas.getContext('2d');
const statusDisplay = document.getElementById('status-display');
const poseIndicator = document.querySelector('.indicator-circle');
const poseText = document.getElementById('pose-text');

let poseFrameCount = 0;
let successTriggered = false;
const HOLD_FRAMES = 30;

async function setupCamera() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({
            video: { width: 640, height: 480, facingMode: 'user' }
        });
        video.srcObject = stream;
        return new Promise((resolve, reject) => {
            video.onloadedmetadata = () => {
                canvas.width = video.videoWidth;
                canvas.height = video.videoHeight;
                resolve(video);
            };
            setTimeout(() => reject(new Error('timeout')), 5000);
        });
    } catch (err) {
        statusDisplay.textContent = 'Camera access denied!';
        throw err;
    }
}

// ── MediaPipe Face Mesh for mouth ─────────────────────────────
// Upper lip top: landmark 13, Lower lip bottom: landmark 14
// Also use 12 (upper) and 15 (lower) for better gap reading
// Inter-eye distance used to normalise so distance/screen-size doesn't matter
function checkMouthOpen(faceLandmarks) {
    if (!faceLandmarks || faceLandmarks.length === 0) return false;
    const lm = faceLandmarks;

    // Upper inner lip: 13, Lower inner lip: 14
    const upperLip = lm[13];
    const lowerLip = lm[14];

    // Eye corners for normalisation (left eye outer: 33, right eye outer: 263)
    const leftEyeOuter  = lm[33];
    const rightEyeOuter = lm[263];

    if (!upperLip || !lowerLip || !leftEyeOuter || !rightEyeOuter) return false;

    const lipGap    = Math.abs(lowerLip.y - upperLip.y) * canvas.height;
    const eyeDist   = Math.abs(rightEyeOuter.x - leftEyeOuter.x) * canvas.width;

    // Ratio: lip gap relative to eye distance
    // Mouth closed: ~0.05–0.10, Mouth wide open: ~0.25–0.50
    const ratio = lipGap / eyeDist;
    return ratio > 0.20; // open threshold
}

// ── MoveNet for hand spread ───────────────────────────────────
function checkHandsSpread(kp) {
    const leftShoulder  = kp[5];
    const rightShoulder = kp[6];
    const leftWrist     = kp[9];
    const rightWrist    = kp[10];

    if (!leftShoulder || !rightShoulder || leftShoulder.score < 0.2 || rightShoulder.score < 0.2) return false;
    if (!leftWrist || !rightWrist || leftWrist.score < 0.15 || rightWrist.score < 0.15) return false;

    const shoulderW = Math.abs(rightShoulder.x - leftShoulder.x);
    const wristW    = Math.abs(rightWrist.x - leftWrist.x);
    return wristW > shoulderW * 0.8;
}

async function run() {
    statusDisplay.textContent = 'Loading...';

    // Load MoveNet
    const poseDetector = await poseDetection.createDetector(
        poseDetection.SupportedModels.MoveNet,
        { modelType: poseDetection.movenet.modelType.SINGLEPOSE_LIGHTNING }
    );

    // Load MediaPipe Face Mesh via CDN
    const faceMesh = new FaceMesh({
        locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`
    });
    faceMesh.setOptions({
        maxNumFaces: 1,
        refineLandmarks: true,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5
    });

    let latestFaceLandmarks = null;
    faceMesh.onResults((results) => {
        if (results.multiFaceLandmarks && results.multiFaceLandmarks.length > 0) {
            latestFaceLandmarks = results.multiFaceLandmarks[0];
        } else {
            latestFaceLandmarks = null;
        }
    });

    statusDisplay.textContent = 'Open mouth wide + spread hands!';

    async function frame() {
        if (successTriggered) return;
        try {
            // Send frame to face mesh
            await faceMesh.send({ image: video });

            // Get pose keypoints
            const poses = await poseDetector.estimatePoses(video);

            // Draw just the video (no skeleton lines)
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

            const mouthOpen  = checkMouthOpen(latestFaceLandmarks);
            const handsSpread = poses.length > 0 ? checkHandsSpread(poses[0].keypoints) : false;
            const allPass = mouthOpen && handsSpread;

            if (allPass) {
                poseFrameCount++;
            } else {
                poseFrameCount = Math.max(0, poseFrameCount - 2);
            }

            const progress = Math.min(poseFrameCount / HOLD_FRAMES, 1);

            // Status text
            const t = '✓', x = '✗';
            statusDisplay.textContent = allPass && progress > 0.1
                ? `✓ Hold it! ${Math.round(progress * 100)}%`
                : `${mouthOpen ? t : x} Mouth open wide   ${handsSpread ? t : x} Hands spread`;

            // Indicator circle
            if (allPass) {
                poseIndicator.classList.add('detected');
                poseText.textContent = '67!';
            } else {
                poseIndicator.classList.remove('detected');
                poseText.textContent = 'Ready';
            }

            // Progress bar only (no skeleton)
            if (progress > 0) {
                ctx.fillStyle = 'rgba(74, 220, 74, 0.8)';
                ctx.fillRect(0, canvas.height - 14, canvas.width * progress, 14);
            }

            // Success!
            if (poseFrameCount >= HOLD_FRAMES && !successTriggered) {
                successTriggered = true;
                if (typeof onPoseSuccess === 'function') onPoseSuccess();
                return;
            }

        } catch (e) { /* keep going */ }
        requestAnimationFrame(frame);
    }

    frame();
}

// Bootstrap
(async () => {
    try {
        await setupCamera();
        video.play();
        await run();
    } catch (err) {
        console.error(err);
    }
})();