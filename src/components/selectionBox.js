export default class ihm_SelectionBox {
  constructor(container) {
    this.container = container;
    this.selectionBox = null;
    this.startX = 0;
    this.startY = 0;
    this.enabled = false; // 默认启用框选
    this.onMouseDown = this.onMouseDown.bind(this);
    this.onMouseMove = this.onMouseMove.bind(this);
    this.onMouseUp = this.onMouseUp.bind(this);
    this.init();
  }

  // 初始化事件监听
  init() {
    this.container.addEventListener("mousedown", this.onMouseDown);
  }

  enable() {
    this.enabled = true;
  }

  disable() {
    this.enabled = false;
  }

  onMouseDown(event) {
    if (!this.enabled) return;

    const containerRect = this.container.getBoundingClientRect();
    this.startX = event.clientX - containerRect.left;
    this.startY = event.clientY - containerRect.top;

    // 创建框选框
    this.selectionBox = document.createElement("div");

    // 设置框选框样式
    this.selectionBox.style.position = "absolute";
    this.selectionBox.style.border = "2px dashed red";
    this.selectionBox.style.backgroundColor = "rgba(255, 0, 0, 0.2)";
    this.selectionBox.style.pointerEvents = "none"; // 确保框选框不阻挡事件
    this.selectionBox.style.left = `${this.startX}px`;
    this.selectionBox.style.top = `${this.startY}px`;
    this.selectionBox.style.width = "0";
    this.selectionBox.style.height = "0";
    this.selectionBox.style.zIndex = "9999";

    this.container.appendChild(this.selectionBox);

    // 监听全局鼠标移动和松开事件
    document.addEventListener("mousemove", this.onMouseMove);
    document.addEventListener("mouseup", this.onMouseUp);
  }

  // 鼠标移动事件：更新框选框大小和位置
  onMouseMove(event) {
    if (!this.enabled) return;
    const containerRect = this.container.getBoundingClientRect();
    const width = event.clientX - containerRect.left - this.startX;
    const height = event.clientY - containerRect.top - this.startY;

    this.selectionBox.style.width = Math.abs(width) + "px";
    this.selectionBox.style.height = Math.abs(height) + "px";
    this.selectionBox.style.left = width > 0 ? `${this.startX}px` : `${this.startX + width}px`;
    this.selectionBox.style.top = height > 0 ? `${this.startY}px` : `${this.startY + height}px`;
  }

  // 鼠标松开事件：完成框选并获取框选区域的坐标信息
  onMouseUp(event) {
    if (!this.enabled) return;
    if (this.selectionBox && this.container.contains(this.selectionBox)) {
      const rect = this.selectionBox.getBoundingClientRect();
      const containerRect = this.container.getBoundingClientRect(); // 获取容器的 rect

      // 计算相对于容器的坐标
      const relativeLeft = rect.left - containerRect.left;
      const relativeTop = rect.top - containerRect.top;
      const relativeMouseUpX = event.clientX - containerRect.left; // 获取鼠标松开时的相对X坐标
      const relativeMouseUpY = event.clientY - containerRect.top; // 获取鼠标松开时的相对Y坐标

      const width = rect.width;
      const height = rect.height;
      const centerX = relativeLeft + width / 2;
      const centerY = relativeTop + height / 2;

      // 计算四个角的坐标 (也需要转换为相对坐标)
      const topLeft = { x: relativeLeft, y: relativeTop };
      const topRight = { x: relativeLeft + width, y: relativeTop };
      const bottomLeft = { x: relativeLeft, y: relativeTop + height };
      const bottomRight = { x: relativeLeft + width, y: relativeTop + height };

      // 判断框选方向
      const directionX = this.startX < relativeMouseUpX ? "leftToRight" : "rightToLeft";
      const directionY = this.startY < relativeMouseUpY ? "topToBottom" : "bottomToTop";

      // 创建自定义事件
      const selectionEvent = new CustomEvent("selectionComplete", {
        detail: {
          top: relativeTop,
          left: relativeLeft,
          width,
          height,
          centerX,
          centerY,
          topLeft,
          topRight,
          bottomLeft,
          bottomRight,
          directionX,
          directionY,
        },
      });

      // 在容器上触发事件
      this.container.dispatchEvent(selectionEvent);

      // 移除框选框
      this.container.removeChild(this.selectionBox);

      // 清理事件监听器
      document.removeEventListener("mousemove", this.onMouseMove);
      document.removeEventListener("mouseup", this.onMouseUp);
    }
  }
}
