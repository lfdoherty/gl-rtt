
//import glslify = require("glslify")

const createFBO = require("@lfdoherty/gl-fbo-single")
const drawTriangle = require("@lfdoherty/fast-big-triangle")
const createShader = require('@lfdoherty/gl-shader')
const f2 = require('@lfdoherty/float2')

const defaultVertexShader = `
attribute vec2 position;
varying vec2 uv;
void main() {
	gl_Position = vec4(position,0.0,1.0);
	uv = 0.5 * (position+1.0);
}`

export interface FboOptions {
	preferFloat?: boolean;
	float?: boolean;
	color?: number;
	depth?: boolean;
	stencil?: boolean;
}

export interface Options extends FboOptions {
	fbo?: any;
}

export class Handle {
	//_shapeVector;
	constructor(_gl, _dim, _fboOptions, _shader) {
		this._gl = _gl;
		this._dim = _dim;
		this._fboOptions = _fboOptions;
		this._shader = _shader;
		//this._shapeVector = [].concat(dim);
	}
	_fbo;
	_getFbo(){
		if(!this._fbo){
			this._fbo = createFBO(this._gl, this._dim.x, this._dim.y, this._fboOptions);
		}
		return this._fbo;
	}
	get fbo() {
		console.assert(this._fbo);
		return this._fbo;
	}
	run(cb/*?: ((uniforms)=>(void|'do-not-fill-screen'))*/, fbo?: any) {
		fbo = fbo || this._getFbo();
		
		const gl = this._gl;
		const shader = this._shader

		gl.disable(gl.DEPTH_TEST);
		gl.disable(gl.CULL_FACE);

		const dim = this._dim
		fbo.bind();

		gl.viewport(0, 0, dim.x, dim.y)
		gl.clearColor(0, 0, 0, 0)
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
		
		shader.bind();
		shader.uniforms.pixelSize = [1 / dim.x, 1 / dim.y];
		shader.uniforms.frameId = Math.random();
		shader.uniforms.resolution = dim.toArray();

		if(cb){
			const result = cb(shader.uniforms, shader.attributes);
			if(result !== 'do-not-fill-screen'){
				drawTriangle(gl);
			}
		}else{
			drawTriangle(gl);
		}
		//gl.bindFramebuffer(gl.FRAMEBUFFER, null)
		//gl.useProgram(null)
		return fbo.color[0];
	}


	get shape() {
		return this._dim.copy();//TODO properly wrap with individual element setters
	}
	set shape(s: f2.T) {
		this._dim = f2.as(s);
		if(this._fbo){
			this._fbo.shape = this._dim.toArray();
		}
	}

}

export function makeShader(gl, shaderStrings){
	const vertShader = shaderStrings.vert || defaultVertexShader;
	const fragShader = shaderStrings.frag || shaderStrings;
	
	const shader = createShader(gl, vertShader, fragShader);
	shader.createdByRtt = true
	return shader;		
}
export function make(gl: WebGLRenderingContext, dim: f2.Duck, shaderStrings: string | { vert: string, frag: string }, options: Options = {}) {
	dim = f2.as(dim)

	const shader = shaderStrings.createdByRtt ? shaderStrings : makeShader(gl, shaderStrings);

	return new Handle(gl, dim, options, shader);

}
