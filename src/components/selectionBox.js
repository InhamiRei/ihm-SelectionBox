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

  // 初始化时创建透明画布，并在画布上进行框选
  init() {
    // 创建透明画布，并添加到容器中
    this.canvas = document.createElement("div");
    this.canvas.style.position = "absolute";
    this.canvas.style.top = "0";
    this.canvas.style.left = "0";
    this.canvas.style.width = "100%";
    this.canvas.style.height = "100%";
    this.container.appendChild(this.canvas);

    // 设置框选框元素，仅创建一次
    this.selectionBox = document.createElement("div");
    this.selectionBox.style.position = "absolute";
    this.selectionBox.style.border = "2px dashed red";
    this.selectionBox.style.backgroundColor = "rgba(255, 0, 0, 0.2)";
    this.selectionBox.style.zIndex = "9999"; // 确保框选框在所有其他元素之上

    // 事件绑定
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

    // 获取鼠标相对于容器的起始坐标
    const containerRect = this.container.getBoundingClientRect();
    this.startX = event.clientX - containerRect.left;
    this.startY = event.clientY - containerRect.top;

    // 确保框选框在画布上，并设置其初始大小为0
    this.selectionBox.style.width = "0";
    this.selectionBox.style.height = "0";
    this.canvas.appendChild(this.selectionBox); // 只需添加一次

    // 监听全局鼠标移动和松开事件
    document.addEventListener("mousemove", this.onMouseMove);
    document.addEventListener("mouseup", this.onMouseUp);
  }

  // 鼠标移动事件：更新框选框大小和位置
  onMouseMove(event) {
    if (!this.enabled) return;

    const containerRect = this.container.getBoundingClientRect();

    // 获取鼠标相对于容器的坐标
    let currentX = event.clientX - containerRect.left;
    let currentY = event.clientY - containerRect.top;

    // 限制鼠标坐标不能超出容器边界
    currentX = Math.max(0, Math.min(currentX, containerRect.width));
    currentY = Math.max(0, Math.min(currentY, containerRect.height));

    // 计算框选框的宽度和高度
    const width = currentX - this.startX;
    const height = currentY - this.startY;

    // 更新框选框的样式：宽度、高度和位置
    this.selectionBox.style.width = Math.abs(width) + "px";
    this.selectionBox.style.height = Math.abs(height) + "px";
    this.selectionBox.style.left = width > 0 ? `${this.startX}px` : `${this.startX + width}px`;
    this.selectionBox.style.top = height > 0 ? `${this.startY}px` : `${this.startY + height}px`;
  }

  // 鼠标松开事件：完成框选并获取框选区域的坐标信息
  onMouseUp(event) {
    if (!this.enabled) return;

    // 获取框选框的尺寸与位置
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

    // 清理框选框，并移除框选框
    this.canvas.removeChild(this.selectionBox);

    // 清理事件监听器
    document.removeEventListener("mousemove", this.onMouseMove);
    document.removeEventListener("mouseup", this.onMouseUp);
  }
}
