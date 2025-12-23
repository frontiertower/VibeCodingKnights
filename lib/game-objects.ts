import {
  KNIGHT_WIDTH,
  KNIGHT_HEIGHT,
  KNIGHT_X,
  JUMP_VELOCITY,
  GRAVITY,
  GROUND_Y,
  BAR_WIDTH,
  BAR_HEIGHT,
  DRAGON_WIDTH,
  DRAGON_HEIGHT,
  DRAGON_Y,
  DUCK_HEIGHT,
  COLORS,
} from './constants';

export class Knight {
  x: number = KNIGHT_X;
  y: number = GROUND_Y - KNIGHT_HEIGHT;
  width: number = KNIGHT_WIDTH;
  height: number = KNIGHT_HEIGHT;
  velocityY: number = 0;
  isJumping: boolean = false;
  isDucking: boolean = false;

  jump() {
    if (!this.isJumping && !this.isDucking) {
      this.velocityY = JUMP_VELOCITY;
      this.isJumping = true;
    }
  }

  duck() {
    if (!this.isJumping) {
      this.isDucking = true;
      this.height = DUCK_HEIGHT;
      this.y = GROUND_Y - DUCK_HEIGHT;
    }
  }

  stopDuck() {
    this.isDucking = false;
    this.height = KNIGHT_HEIGHT;
    this.y = GROUND_Y - KNIGHT_HEIGHT;
  }

  update() {
    if (this.isJumping) {
      this.velocityY += GRAVITY;
      this.y += this.velocityY;

      if (this.y >= GROUND_Y - this.height) {
        this.y = GROUND_Y - this.height;
        this.velocityY = 0;
        this.isJumping = false;
      }
    }
  }

  draw(ctx: CanvasRenderingContext2D) {
    // Knight body - cyberpunk purple
    ctx.fillStyle = COLORS.purple;
    ctx.fillRect(this.x, this.y, this.width, this.height);

    // Glowing outline effect
    ctx.strokeStyle = COLORS.purpleLight;
    ctx.lineWidth = 2;
    ctx.strokeRect(this.x, this.y, this.width, this.height);

    // Add glow effect
    ctx.shadowBlur = 15;
    ctx.shadowColor = COLORS.purple;
    ctx.strokeRect(this.x, this.y, this.width, this.height);
    ctx.shadowBlur = 0;

    // Knight helmet (top part)
    ctx.fillStyle = COLORS.cyan;
    const helmetHeight = this.height * 0.3;
    ctx.fillRect(this.x + 5, this.y, this.width - 10, helmetHeight);

    // Visor (eyes)
    ctx.fillStyle = COLORS.pink;
    ctx.fillRect(this.x + 8, this.y + 5, 5, 3);
    ctx.fillRect(this.x + this.width - 13, this.y + 5, 5, 3);
  }

  getHitbox() {
    return {
      x: this.x + 2,
      y: this.y + 2,
      width: this.width - 4,
      height: this.height - 4,
    };
  }
}

export class Bar {
  x: number;
  y: number = GROUND_Y - BAR_HEIGHT;
  width: number = BAR_WIDTH;
  height: number = BAR_HEIGHT;
  passed: boolean = false;

  constructor(x: number) {
    this.x = x;
  }

  update(speed: number) {
    this.x -= speed;
  }

  draw(ctx: CanvasRenderingContext2D) {
    // Energy bar with gradient - brighter colors
    const gradient = ctx.createLinearGradient(this.x, this.y, this.x, this.y + this.height);
    gradient.addColorStop(0, COLORS.purpleLight);
    gradient.addColorStop(0.5, COLORS.purple);
    gradient.addColorStop(1, COLORS.purpleLight);

    ctx.fillStyle = gradient;
    ctx.fillRect(this.x, this.y, this.width, this.height);

    // Strong glow effect
    ctx.shadowBlur = 25;
    ctx.shadowColor = COLORS.purpleLight;
    ctx.fillRect(this.x, this.y, this.width, this.height);
    ctx.shadowBlur = 0;

    // Bright energy core
    ctx.fillStyle = COLORS.cyan;
    ctx.shadowBlur = 15;
    ctx.shadowColor = COLORS.cyan;
    ctx.fillRect(this.x + this.width / 2 - 2, this.y + 10, 4, this.height - 20);
    ctx.shadowBlur = 0;
    
    // Add bright outline
    ctx.strokeStyle = COLORS.cyan;
    ctx.lineWidth = 2;
    ctx.strokeRect(this.x, this.y, this.width, this.height);
  }

  isOffScreen() {
    return this.x + this.width < 0;
  }

  getHitbox() {
    return {
      x: this.x,
      y: this.y,
      width: this.width,
      height: this.height,
    };
  }
}

export class Dragon {
  x: number;
  y: number = DRAGON_Y;
  width: number = DRAGON_WIDTH;
  height: number = DRAGON_HEIGHT;
  passed: boolean = false;
  wingOffset: number = 0;

  constructor(x: number) {
    this.x = x;
  }

  update(speed: number) {
    this.x -= speed;
    this.wingOffset = (this.wingOffset + 0.3) % (Math.PI * 2);
  }

  draw(ctx: CanvasRenderingContext2D) {
    // Dragon body - brighter pink with glow
    ctx.fillStyle = COLORS.pink;
    ctx.shadowBlur = 20;
    ctx.shadowColor = COLORS.pink;
    ctx.fillRect(this.x + 15, this.y + 8, 20, 14);

    // Dragon head
    ctx.fillRect(this.x + 35, this.y + 10, 12, 10);
    ctx.shadowBlur = 0;

    // Bright glowing eyes
    ctx.fillStyle = COLORS.cyan;
    ctx.shadowBlur = 15;
    ctx.shadowColor = COLORS.cyan;
    ctx.fillRect(this.x + 40, this.y + 12, 4, 4);
    ctx.shadowBlur = 0;

    // Animated wings - brighter
    const wingFlap = Math.sin(this.wingOffset) * 5;
    
    // Left wing
    ctx.fillStyle = COLORS.purpleLight;
    ctx.shadowBlur = 15;
    ctx.shadowColor = COLORS.purple;
    ctx.beginPath();
    ctx.moveTo(this.x + 15, this.y + 10);
    ctx.lineTo(this.x, this.y + wingFlap);
    ctx.lineTo(this.x + 10, this.y + 15);
    ctx.closePath();
    ctx.fill();

    // Right wing
    ctx.beginPath();
    ctx.moveTo(this.x + 35, this.y + 10);
    ctx.lineTo(this.x + 50, this.y + wingFlap);
    ctx.lineTo(this.x + 40, this.y + 15);
    ctx.closePath();
    ctx.fill();
    ctx.shadowBlur = 0;

    // Bright outline
    ctx.strokeStyle = COLORS.cyan;
    ctx.lineWidth = 2;
    ctx.shadowBlur = 10;
    ctx.shadowColor = COLORS.cyan;
    ctx.strokeRect(this.x + 15, this.y + 8, 20, 14);
    ctx.shadowBlur = 0;

    // Tail - brighter
    ctx.fillStyle = COLORS.pink;
    ctx.fillRect(this.x + 8, this.y + 15, 10, 4);
  }

  isOffScreen() {
    return this.x + this.width < 0;
  }

  getHitbox() {
    return {
      x: this.x + 10,
      y: this.y + 8,
      width: this.width - 15,
      height: this.height - 8,
    };
  }
}