

const glRtt = require('./rtt')

const shell = require("gl-now")()
const glslify = require("glslify")
const displayTexture = require('@lfdoherty/gl-texture2d-display')
const f2 = require('@lfdoherty/float2')

const fit = require('canvas-fit')
let rttHandle
shell.on("gl-init", function() {
	const gl = shell.gl


	const dim = f2.vec(shell.width/10, shell.height/10);

	rttHandle = glRtt.make(gl, dim, glslify('./demo.frag'));

	window.addEventListener('resize', function() {
		fit(shell.canvas, window)
	})
})

shell.on("gl-render", function() {
	const texture = rttHandle.run();
	displayTexture(texture, 10);
})
shell.on('gl-resize', (width, height) => {
	if (!rttHandle) return;

	rttHandle.shape = f2.vec(width/10, height/10);
})

shell.on("gl-error", function(e) {
	console.log(e);
	throw new Error("WebGL not supported?")
}) 