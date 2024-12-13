document.addEventListener('DOMContentLoaded', async () => {
  const enterVRButton = document.getElementById('enterVR');
  const leftControllerTransform = document.getElementById('leftControllerTransform');
  const rightControllerTransform = document.getElementById('rightControllerTransform');
  let xrSession = null;

  // Utility to load a GLB file into the scene
  function loadGLB(transformNode, url) {
    const inlineNode = document.createElement('inline');
    inlineNode.setAttribute('url', url);
    transformNode.appendChild(inlineNode);
  }

  // Load the GLB models
  loadGLB(leftControllerTransform, 'Quest3_left.glb');
  loadGLB(rightControllerTransform, 'Quest3_right.glb');

  // WebXR setup and VR session initialization
  async function startVR() {
    try {
      xrSession = await navigator.xr.requestSession('immersive-vr', {
        optionalFeatures: ['local-floor', 'bounded-floor']
      });

      const xrReferenceSpace = await xrSession.requestReferenceSpace('local');

      xrSession.updateRenderState({
        baseLayer: new XRWebGLLayer(xrSession, document.createElement('canvas').getContext('webgl', { xrCompatible: true }))
      });

      // Start rendering and tracking controllers
      xrSession.requestAnimationFrame((time, xrFrame) => onXRFrame(time, xrFrame, xrReferenceSpace));
    } catch (err) {
      console.error('Failed to start WebXR session:', err);
    }
  }

  function onXRFrame(time, xrFrame, xrReferenceSpace) {
    const session = xrFrame.session;

    for (const inputSource of session.inputSources) {
      if (inputSource && inputSource.targetRayMode === 'tracked-pointer') {
        const gripPose = xrFrame.getPose(inputSource.targetRaySpace, xrReferenceSpace);

        if (gripPose) {
          const position = gripPose.transform.position;
          const targetTransform = inputSource.handedness === 'left' ? leftControllerTransform : rightControllerTransform;

          // Update the transform node with controller position
          targetTransform.setAttribute('translation', `${position.x} ${position.y} ${position.z}`);
        }
      }
    }

    session.requestAnimationFrame((time, xrFrame) => onXRFrame(time, xrFrame, xrReferenceSpace));
  }

  // Attach VR session to the button
  enterVRButton.addEventListener('click', startVR);
});
