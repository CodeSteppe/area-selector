class AreaSelector {
  constructor({
    element
  }) {
    this.element = element;
    this.#createSelectArea();
    this.#handleMouseDown();
    this.#handleMouseMove();
    this.#handleMouseUp();
  }

  // private properties
  #area;
  #startPoint;
  #endPoint;
  #mousemoveHandler

  // private methods
  #createSelectArea = () => {
    const area = document.createElement('div');
    this.element.style.position = 'relative';
    area.style.position = 'absolute';
    area.style.border = '1px solid #fff';
    area.style.backgroundColor = 'rgba(255,255,255,0.5)';
    this.element.append(area);
    this.#area = area;
  }

  #getMousePositionInElement = (mouseX, mouseY) => {
    const rect = this.element.getBoundingClientRect();
    const { left, top, width, height } = rect;
    let x = mouseX - left;
    let y = mouseY - top;
    if (x <= 0) {
      x = 0;
    } else if (x > width) {
      x = width;
    }

    if (y <= 0) {
      y = 0;
    } else if (y > height) {
      y = height;
    }

    return { x, y };
  }

  #handleMouseDown = () => {
    this.element.addEventListener('mousedown', e => {
      const { clientX, clientY } = e;
      this.#startPoint = this.#getMousePositionInElement(clientX, clientY);
    });
  }

  #handleMouseMove = () => {
    this.#mousemoveHandler = e => {
      const { clientX, clientY } = e;
      this.#endpoint = this.#getMousePositionInElement(clientX, clientY);
      this.#updateArea();
    }
    window.addEventListener('mousemove', this.#mousemoveHandler);
  }

  #handleMouseUp = () => {
    this.element.addEventListener('mouseup', e => {
      window.removeEventListener('mousemove', this.#mousemoveHandler);
    });
  }

  #updateArea = () => {
    const top = Math.min(this.#startPoint.x, this.#endPoint.x);
    const left = Math.min(this.#startPoint.y, this.#endPoint.y);
    const width = Math.abs(this.#startPoint.x - this.#endPoint.x);
    const height = Math.abs(this.#startPoint.y - this.#endPoint.y);
    this.#area.style.top = top + 'px';
    this.#area.style.left = left + 'px';
    this.#area.style.width = width + 'px';
    this.#area.style.height = height + 'px';
  }
}