import {IBodyRenderOptions} from "matter-js";

const defaultRender: IBodyRenderOptions = {
  lineWidth:   1,
  strokeStyle: 'rgba(255,0,0,1)',
  fillStyle:   'transparent',
};

export default defaultRender;

export const planetDebugRender: IBodyRenderOptions = {
  fillStyle:   '#812344',
  strokeStyle: '#812344',
  lineWidth:   1,
};