class AreaSelector {
  constructor({
    element,
    selectableTargetSelector,
    datasetKeyForSelection,
    onSelectionChange
  }) {
    this.element = element;
    this.selectableTargetSelector = selectableTargetSelector;
    this.datasetKeyForSelection = datasetKeyForSelection;
    this.onSelectionChange = onSelectionChange;
    this.selectedIds = [];
    this.#createSelectArea();
    this.#handleMouseDown();
    this.#handleMouseUp();
  }

  // private properties
  #area;
  #startPoint;
  #endPoint;
  #mouseMoveHandler;
  #ctrlKeyPressed;
  #tempSelectedIds = [];
  #toBeUnselectedIds = [];

  // private methods
  #createSelectArea = () => {
    const area = document.createElement('div');
    this.element.style.position = 'relative';
    area.style.position = 'absolute';
    area.style.border = '1px solid rgb(0,119,255)';
    area.style.background = 'rgba(0,119,255,0.2)';
    this.element.appendChild(area);
    this.#area = area;
  }

  #twoRectsHaveIntersection = (rect1, rect2) => {
    const left1 = rect1.left;
    const left2 = rect2.left;
    const right1 = rect1.left + rect1.width;
    const right2 = rect2.left + rect2.width;

    const top1 = rect1.top;
    const top2 = rect2.top;
    const bottom1 = rect1.top + rect1.height;
    const bottom2 = rect2.top + rect2.height;

    const width1 = rect1.width;
    const width2 = rect2.width;
    const height1 = rect1.height;
    const height2 = rect2.height;

    const noIntersection = left2 > right1 || left1 > right2 || bottom1 < top2 || bottom2 < top1 || width1 <= 0 || width2 <= 0 || height1 <= 0 || height2 <= 0;

    return !noIntersection;
  }

  #selectItems = () => {
    const areaRect = this.#area.getBoundingClientRect();
    const items = this.element.querySelectorAll(this.selectableTargetSelector);
    for (const item of items) {
      const itemRect = item.getBoundingClientRect();
      const hasIntersection = this.#twoRectsHaveIntersection(areaRect, itemRect);
      const itemId = item.dataset[this.datasetKeyForSelection];
      const index = this.selectedIds.indexOf(itemId);
      const tempIndex = this.#tempSelectedIds.indexOf(itemId);
      let selected;
      if (this.#toBeUnselectedIds.includes(itemId)) {
        selected = false;
      } else {
        if (this.#ctrlKeyPressed) {
          if (index >= 0) {
            if (hasIntersection) {
              selected = false;
              this.#toBeUnselectedIds.push(itemId);
            } else {
              selected = true
            }
          } else {
            selected = hasIntersection;
          }
        } else {
          selected = hasIntersection;
        }
      }

      item.dataset.selected = selected;
      if (selected) {
        if (tempIndex === -1) {
          this.#tempSelectedIds.push(itemId);
        }
      } else {
        if (tempIndex >= 0) {
          this.#tempSelectedIds.splice(tempIndex, 1);
        }
        if (index >= 0) {
          this.selectedIds.splice(index, 1);
        }
      }
    }
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

  #hideArea = () => {
    this.#area.style.display = 'none';
  }

  #showArea = () => {
    this.#area.style.display = 'block';
  }

  #getRelativePositionInElement = (clientX, clientY) => {
    const rect = this.element.getBoundingClientRect();
    const { left, top } = rect;
    const { scrollLeft, scrollTop, scrollWidth, scrollHeight } = this.element;
    let x = clientX - left + scrollLeft;
    let y = clientY - top + scrollTop;
    if (x < 0) {
      x = 0;
    } else if (x > scrollWidth) {
      x = scrollWidth;
    }

    if (y < 0) {
      y = 0;
    } else if (y > scrollHeight) {
      y = scrollHeight;
    }

    return { x: Math.round(x), y: Math.round(y) };
  }

  #handleMouseDown = () => {
    this.element.addEventListener('mousedown', e => {
      const { clientX, clientY, ctrlKey } = e;
      this.#ctrlKeyPressed = ctrlKey;
      this.#tempSelectedIds = [];
      this.#toBeUnselectedIds = [];
      if (!ctrlKey) {
        this.selectedIds = [];
      }
      this.#startPoint = this.#getRelativePositionInElement(clientX, clientY);
      // console.log('start point', this.#startPoint);
      this.#endPoint = this.#startPoint;
      this.#updateArea();
      this.#showArea();
      this.#handleMouseMove();
    });
  }

  #handleMouseMove = () => {
    this.#mouseMoveHandler = (e) => {
      const { clientX, clientY } = e;
      this.#endPoint = this.#getRelativePositionInElement(clientX, clientY);
      // console.log('end point', this.#endPoint);
      this.#updateArea();
      this.#scrollOnDrag(clientX, clientY);
    }
    window.addEventListener('mousemove', this.#mouseMoveHandler);
  }

  #handleMouseUp = () => {
    window.addEventListener('mouseup', e => {
      window.removeEventListener('mousemove', this.#mouseMoveHandler);
      this.#hideArea();
      console.log('mouseup', this);
      this.selectedIds.push(...this.#tempSelectedIds);
    });
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
      this.element.scrollBy({
        left: scrollX,
        top: scrollY,
        behavior: 'auto'
      });
    }
  }
}