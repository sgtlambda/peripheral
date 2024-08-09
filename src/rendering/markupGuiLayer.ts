import {createRoot} from "react-dom/client";

import Layer from "./Layer";
import Camera from "./Camera";
import {uiRoot} from "../ui/uiRoot";

/**
 * Determine the "transform" CSS string such that elements can be positioned
 * absolutely within the given element and align with the viewport in accordance
 * with the bounds of the given camera.
 */
function toTransform(element: HTMLElement, camera: Camera): string {

  const elementBounds = element.getBoundingClientRect();

  const desiredCenter = {
    x: (camera.bounds.max.x + camera.bounds.min.x) / 2,
    y: (camera.bounds.max.y + camera.bounds.min.y) / 2,
  };

  // const scale         = element.getBoundingClientRect().width / (camera.bounds.max.x - camera.bounds.min.x);
  // TODO something with scale (?)

  return `translate(${elementBounds.width / 2 - desiredCenter.x}px, ${elementBounds.height / 2 - desiredCenter.y}px)`;
}

export const createMarkupGuiRenderer = () => {

  const element = document.createElement("div");

  const reactRoot = createRoot(element);

  reactRoot.render(uiRoot)

  element.classList.add('markup-gui-layer');

  const layer = new Layer({
    render(context, renderer, camera) {
      // Adjust the transform of the element to match the camera
      element.style.transform = toTransform(element, camera);
    },
  });

  return {layer, element};
};