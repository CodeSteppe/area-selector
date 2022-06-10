class AreaSelector {
  constructor({
    element,
    selectableTargetSelector
  }) {
    this.element = element;
    this.selectableTargetSelector = selectableTargetSelector;
    this.#createSelectArea();
    this.#handleMouseDown();
    this.#handleMouseUp();
  }

  // private properties
  #area;
  #areaRect;
  #startPoint;
  #endPoint;
  #mousemoveHandler

  // private methods
  #createSelectArea = () => {
    const area = document.createElement('div');
    this.element.style.position = 'relative';
    area.style.position = 'absolute';
    area.style.border = '1px solid rgb(0, 119, 255)';
    area.style.backgroundColor = 'rgba(0, 119, 255, 0.2)';
    this.element.append(area);
    this.#area = area;
  }

  #getRelativePositionInElement = (clientX, clientY) => {
    const rect = this.element.getBoundingClientRect();
    const { left, top, width, height } = rect;
    const { scrollTop, scrollHeight } = this.element
    let x = clientX - left;
    let y = clientY - top + scrollTop;
    if (x <= 0) {
      x = 0;
    } else if (x > width) {
      x = width;
    }

    if (y <= 0) {
      y = 0;
    } else if (y > scrollHeight) {
      y = scrollHeight;
    }

    return { x, y };
  }

  #handleMouseDown = () => {
    this.element.addEventListener('mousedown', e => {
      const { clientX, clientY } = e;
      this.#startPoint = this.#getRelativePositionInElement(clientX, clientY);
      this.#endPoint = this.#startPoint;
      this.#updateArea();
      this.#showArea();
      this.#handleMouseMove();
    });
  }

  #handleMouseMove = () => {
    this.#mousemoveHandler = e => {
      const { clientX, clientY } = e;
      this.#endPoint = this.#getRelativePositionInElement(clientX, clientY);
      this.#updateArea();
      this.#scrollOnDrag(clientY);
    }
    window.addEventListener('mousemove', this.#mousemoveHandler);
  }

  #handleMouseUp = () => {
    window.addEventListener('mouseup', e => {
      window.removeEventListener('mousemove', this.#mousemoveHandler);
      this.#hideArea();
    });
  }

  #showArea = () => {
    this.#area.style.display = 'block';
  }

  #hideArea = () => {
    this.#area.style.display = 'none';
  }

  #updateArea = () => {
    console.log('updateArea')
    const top = Math.min(this.#startPoint.y, this.#endPoint.y);
    const left = Math.min(this.#startPoint.x, this.#endPoint.x);
    const width = Math.abs(this.#startPoint.x - this.#endPoint.x);
    const height = Math.abs(this.#startPoint.y - this.#endPoint.y);
    this.#area.style.top = top + 'px';
    this.#area.style.left = left + 'px';
    this.#area.style.width = width + 'px';
    this.#area.style.height = height + 'px';
    this.#areaRect = { top, left, width, height };
    this.#selectItems();
  }

  #selectItems = () => {
    const areaRect = this.#area.getBoundingClientRect();
    const items = this.element.querySelectorAll(this.selectableTargetSelector);
    for (const item of items) {
      const itemRect = item.getBoundingClientRect();
      const hasIntersection = this.#twoRectsHaveIntersection(areaRect, itemRect);
      item.dataset.selected = hasIntersection ? true : false;
    }
  }

  #twoRectsHaveIntersection = (rect1, rect2) => {
    let left1 = rect1.left;
    let left2 = rect2.left;
    let right1 = rect1.left + rect1.width;
    let right2 = rect2.left + rect2.width;

    let top1 = rect1.top;
    let top2 = rect2.top;
    let bottom1 = rect1.top + rect1.height;
    let bottom2 = rect2.top + rect2.height;

    const noIntersection = left2 > right1 || left1 > right2 || bottom1 < top2 || bottom2 < top1;
    return !noIntersection;
  }

  #scrollOnDrag = (mouseY) => {
    const { y, height } = this.element.getBoundingClientRect();
    if (mouseY > (y + height)) {
      this.element.scrollBy({ top: 100, behavior: 'smooth' });
    }
  }
}