/**
 * Created with the standard prompt, plus:
 * draws animated random lines that fly off in random directions when painted
 */
plugins.AnimatedLines1 = class extends Tool {
    constructor(name) {
        super(name);
        this.name = name;
        this.description = 'Animated Lines Tool';
        this.icon = 'fa-bezier-curve';
        this.lines = [];
        this.line_length = 5;
        this.activated = false;
    }

    paint(e) {
        if (!this.painting) return;
        let mousePos = this.getMousePos(this.canvas, e);
        const x = mousePos.x - this.canvas.offsetLeft;
        const y = mousePos.y - this.canvas.offsetTop;
        const angle = Math.random() * Math.PI * 2;
        const length = Math.random() * 20 + parseInt(this.line_length);
        const speed = Math.random() * 5 + 1;

        this.lines.push({
            x, y, angle, length, speed,
            opacity: 1.0
        });
    }

    update() {
        if (this.ctx == null) {
            return;
        }
        
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.lines.forEach(line => {
            this.ctx.beginPath();
            this.ctx.moveTo(line.x, line.y);
            this.ctx.lineTo(line.x + Math.cos(line.angle) * line.length, line.y + Math.sin(line.angle) * line.length);
            this.ctx.strokeStyle = `rgba(0, 0, 0, ${line.opacity})`;
            this.ctx.stroke();

            // Update line position and opacity
            line.x += Math.cos(line.angle) * line.speed;
            line.y += Math.sin(line.angle) * line.speed;
            line.opacity -= 0.02;
        });
        // Remove lines that are fully faded
        this.lines = this.lines.filter(line => line.opacity > 0);
    }

    customUI(container) {
        // Create a line length control
        const lineLengthControl = document.createElement('input');
        lineLengthControl.type = 'range';
        lineLengthControl.min = '1';
        lineLengthControl.max = '100';
        lineLengthControl.value = '5';
        lineLengthControl.onchange = (e) => {
            this.line_length = e.target.value;
        };

        container.appendChild(lineLengthControl);
    }
}
