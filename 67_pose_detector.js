const video = document.getElementById('video');
const canvas = document.getElementById('output');
const ctx = canvas.getContext('2d');
const statusDisplay = document.getElementById('status-display');
const poseIndicator = document.querySelector('.indicator-circle');
const poseText = document.getElementById('pose-text');

let isPosing = false;
let poseFrameCount = 0;
let previousElbowPositions = { left: null, right: null };
let armMotionBuffer = [];

const POSE_DETECTION_THRESHOLD = 8; // frames to confirm pose
const MOTION_BUFFER_SIZE = 15; // track recent arm movements

async function setupCamera() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
            video: { width: 640, height: 480 } 
        });
        video.srcObject = stream;
        
        return new Promise((resolve, reject) => {
            video.onloadedmetadata = () => {
                canvas.width = video.videoWidth;
                canvas.height = video.videoHeight;
                console.log('Camera loaded:', canvas.width, 'x', canvas.height);
                resolve(video);
            };
            setTimeout(() => reject(new Error('Camera setup timeout')), 5000);
        });
    } catch (error) {
        console.error('Camera setup failed:', error);
        statusDisplay.textContent = 'Camera access denied';
        alert('Camera access denied. Please allow camera permissions.');
        throw error;
    }
}

async function loadModel() {
    try {
        console.log('Loading MoveNet model...');
        statusDisplay.textContent = 'Loading model...';
        const detector = await poseDetection.createDetector(
            poseDetection.SupportedModels.MoveNet,
            { modelType: poseDetection.movenet.modelType.SINGLEPOSE_LIGHTNING }
        );
        console.log('Model loaded successfully');
        statusDisplay.textContent = 'Ready! Do the 67 pose!';
        return detector;
    } catch (error) {
        console.error('Model loading failed:', error);
        statusDisplay.textContent = 'Model loading failed';
        alert('Failed to load pose detection model');
        throw error;
    }
}

function detect67Pose(keypoints) {
    // 67 pose: Arms bent at 90 degrees, pumping up and down while standing upright
    // Key indicators:
    // - Shoulders and hips aligned vertically (standing upright)
    // - Both elbows bent at roughly 90 degrees
    // - Arms moving vertically (up and down motion)
    
    const nose = keypoints[0];
    const leftShoulder = keypoints[5];
    const rightShoulder = keypoints[6];
    const leftElbow = keypoints[7];
    const rightElbow = keypoints[8];
    const leftWrist = keypoints[9];
    const rightWrist = keypoints[10];
    const leftHip = keypoints[11];
    const rightHip = keypoints[12];
    
    // Check if all key points have sufficient confidence
    const minConfidence = 0.35;
    const requiredPoints = [
        nose, leftShoulder, rightShoulder, leftElbow, rightElbow,
        leftWrist, rightWrist, leftHip, rightHip
    ];
    
    if (requiredPoints.some(p => !p || p.score < minConfidence)) {
        return false;
    }
    
    // Check 1: Standing upright (shoulders and hips aligned)
    const avgShoulderX = (leftShoulder.x + rightShoulder.x) / 2;
    const avgHipX = (leftHip.x + rightHip.x) / 2;
    const shoulderHipAligned = Math.abs(avgShoulderX - avgHipX) < 40;
    
    // Check 2: Body is mostly vertical (not bent forward)
    const avgShoulderY = (leftShoulder.y + rightShoulder.y) / 2;
    const avgHipY = (leftHip.y + rightHip.y) / 2;
    const bodyVertical = avgHipY > avgShoulderY + 80; // Hip below shoulder
    
    // Check 3: Arms bent at 90 degrees
    // Calculate angles for both arms
    const leftArmAngle = calculateArmAngle(leftShoulder, leftElbow, leftWrist);
    const rightArmAngle = calculateArmAngle(rightShoulder, rightElbow, rightWrist);
    
    const leftArmBent = Math.abs(leftArmAngle - 90) < 35; // Between 55-125 degrees
    const rightArmBent = Math.abs(rightArmAngle - 90) < 35;
    
    // Check 4: Arms are perpendicular to body (raised up)
    // Elbows should be at similar height or higher than shoulders
    const leftElbowRaised = leftElbow.y < leftShoulder.y + 30;
    const rightElbowRaised = rightElbow.y < rightShoulder.y + 30;
    
    // Check 5: Wrists are below elbows (arms bent downward)
    const leftWristBelow = leftWrist.y > leftElbow.y - 10;
    const rightWristBelow = rightWrist.y > rightElbow.y - 10;
    
    // Detect vertical arm motion
    const hasVerticalMotion = detectArmMotion(leftElbow, rightElbow);
    
    return shoulderHipAligned && bodyVertical && leftArmBent && rightArmBent && 
           leftElbowRaised && rightElbowRaised && leftWristBelow && rightWristBelow && hasVerticalMotion;
}

function calculateArmAngle(shoulder, elbow, wrist) {
    // Calculate angle between shoulder-elbow-wrist (in degrees)
    const vec1 = { x: elbow.x - shoulder.x, y: elbow.y - shoulder.y };
    const vec2 = { x: wrist.x - elbow.x, y: wrist.y - elbow.y };
    
    const dot = vec1.x * vec2.x + vec1.y * vec2.y;
    const det = vec1.x * vec2.y - vec1.y * vec2.x;
    const angle = Math.abs(Math.atan2(det, dot) * 180 / Math.PI);
    
    return angle;
}

function detectArmMotion(leftElbow, rightElbow) {
    // Track vertical motion of elbows
    if (!leftElbow || !rightElbow) return false;
    
    const elbowY = (leftElbow.y + rightElbow.y) / 2;
    armMotionBuffer.push(elbowY);
    
    if (armMotionBuffer.length > MOTION_BUFFER_SIZE) {
        armMotionBuffer.shift();
    }
    
    if (armMotionBuffer.length < 8) return false;
    
    // Check if there's enough vertical movement (arms pumping)
    const minY = Math.min(...armMotionBuffer);
    const maxY = Math.max(...armMotionBuffer);
    const verticalRange = maxY - minY;
    
    return verticalRange > 25; // Minimum 25 pixel movement for valid pumping
}

async function detectPose(detector) {
    async function render() {
        try {
            const poses = await detector.estimatePoses(video);
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

            // Draw keypoints and skeleton
            if (poses.length > 0) {
                const pose = poses[0];
                
                // Check for 67 pose
                const is67Pose = detect67Pose(pose.keypoints);
                
                if (is67Pose) {
                    poseFrameCount++;
                } else {
                    poseFrameCount = Math.max(0, poseFrameCount - 1);
                }
                
                const poseConfirmed = poseFrameCount >= POSE_DETECTION_THRESHOLD;
                
                // Update visual indicator
                if (poseConfirmed !== isPosing) {
                    isPosing = poseConfirmed;
                    if (isPosing) {
                        poseIndicator.classList.add('detected');
                        poseText.textContent = '✓ 67!';
                        statusDisplay.textContent = '✓ 67 POSE DETECTED!';
                        console.log('67 POSE DETECTED!');
                    } else {
                        poseIndicator.classList.remove('detected');
                        poseText.textContent = 'Ready';
                        statusDisplay.textContent = 'Do the 67 pose!';
                    }
                }
                
                // Draw all keypoints
                pose.keypoints.forEach(keypoint => {
                    if (keypoint.score > 0.3) {
                        const color = is67Pose ? '#4a9a3a' : '#ff6b6b';
                        ctx.beginPath();
                        ctx.arc(keypoint.x, keypoint.y, 6, 0, 2 * Math.PI);
                        ctx.fillStyle = color;
                        ctx.fill();
                        ctx.strokeStyle = 'white';
                        ctx.lineWidth = 2;
                        ctx.stroke();
                    }
                });

                // Draw skeleton lines
                const adjacentKeyPoints = poseDetection.util.getAdjacentPairs(
                    poseDetection.SupportedModels.MoveNet
                );
                adjacentKeyPoints.forEach(([i, j]) => {
                    const kp1 = pose.keypoints[i];
                    const kp2 = pose.keypoints[j];
                    if (kp1.score > 0.3 && kp2.score > 0.3) {
                        const color = is67Pose ? '#4a9a3a' : '#00ff00';
                        ctx.beginPath();
                        ctx.moveTo(kp1.x, kp1.y);
                        ctx.lineTo(kp2.x, kp2.y);
                        ctx.strokeStyle = color;
                        ctx.lineWidth = 3;
                        ctx.stroke();
                    }
                });
            }

            requestAnimationFrame(render);
        } catch (error) {
            console.error('Pose detection error:', error);
            requestAnimationFrame(render);
        }
    }

    render();
}

(async () => {
    try {
        await setupCamera();
        video.play();
        const detector = await loadModel();
        await detectPose(detector);
    } catch (error) {
        console.error('Fatal error:', error);
    }
})();