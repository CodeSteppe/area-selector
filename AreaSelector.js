class AreaSelector {
  constructor({
    element,
    selectableTargetSelector,
    dataSetKeyForSelection,
    onSelectionChange
  }) {
    this.element = element;
    this.selectableTargetSelector = selectableTargetSelector;
    this.dataSetKeyForSelection = dataSetKeyForSelection;
    this.onSelectionChange = onSelectionChange;
    this.#createSelectArea();
    this.#handleMouseDown();
    this.#handleMouseUp();
    this.selectedIds = [];
  }

  // private properties
  #area;
  #startPoint;
  #endPoint;
  #mouseMoveHandler;

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
    const { left, top } = rect;
    const { scrollLeft, scrollTop, scrollWidth, scrollHeight } = this.element;
    let x = clientX - left + scrollLeft;
    let y = clientY - top + scrollTop;
    if (x <= 0) {
      x = 0;
    } else if (x > scrollWidth) {
      x = scrollWidth;
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
    this.#mouseMoveHandler = e => {
      const { clientX, clientY } = e;
      this.#endPoint = this.#getRelativePositionInElement(clientX, clientY);
      this.#updateArea();
      this.#scrollOnDrag(clientX, clientY);
    }
    window.addEventListener('mousemove', this.#mouseMoveHandler);
  }

  #handleMouseUp = () => {
    window.addEventListener('mouseup', e => {
      window.removeEventListener('mousemove', this.#mouseMoveHandler);
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
    const top = Math.min(this.#startPoint.y, this.#endPoint.y);
    const left = Math.min(this.#startPoint.x, this.#endPoint.x);
    const width = Math.abs(this.#startPoint.x - this.#endPoint.x);
    const height = Math.abs(this.#startPoint.y - this.#endPoint.y);
    this.#area.style.top = top + 'px';
    this.#area.style.left = left + 'px';
    this.#area.style.width = width + 'px';
    this.#area.style.height = height + 'px';
    this.#selectItems();
  }

  #selectItems = () => {
    const areaRect = this.#area.getBoundingClientRect();
    const items = this.element.querySelectorAll(this.selectableTargetSelector);
    let hasChange;
    for (const item of items) {
      const itemRect = item.getBoundingClientRect();
      const hasIntersection = this.#twoRectsHaveIntersection(areaRect, itemRect);
      const selected = hasIntersection ? true : false;
      item.dataset.selected = selected;
      const itemId = item.dataset[this.dataSetKeyForSelection];
      const index = this.selectedIds.indexOf(itemId);
      if (selected) {
        if (index === -1) {
          this.selectedIds.push(itemId);
          hasChange = true;
        }
      } else {
        if (index >= 0) {
          this.selectedIds.splice(index, 1);
          hasChange = true;
        }
      }
    }
    if (hasChange) {
      this.onSelectionChange(this.selectedIds);
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

    let width1 = rect1.width;
    let width2 = rect2.width;
    let height1 = rect1.height;
    let height2 = rect2.height;

    const noIntersection = left2 > right1 || left1 > right2 || bottom1 < top2 || bottom2 < top1 || width1 <= 0 || width2 <= 0 || height1 <= 0 || height2 <= 0;
    return !noIntersection;
  }


  #scrollOnDrag = (mouseX, mouseY) => {
    const { x, y, width, height } = this.element.getBoundingClientRect();
    let scrollX, scrollY;

    if (mouseX < x) {
      scrollX = mouseX - x;
    } else if (mouseX > (x + width)) {
      scrollX = mouseX - (x + width);
    }

    if (mouseY < y) {
      scrollY = mouseY - y;
    } else if (mouseY > (y + height)) {
      scrollY = mouseY - (y + height);
    }

    if (scrollX || scrollY) {
      this.element.scrollBy({ left: scrollX, top: scrollY, behavior: 'auto' });
    }
  }
}