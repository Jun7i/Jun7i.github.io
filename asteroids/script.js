
function extend(ChildClass, ParentClass) {
    var parent = new ParentClass();
    ChildClass.prototype = parent;
    ChildClass.prototype.super = parent.constructor;
    ChildClass.prototype.constructor = ChildClass;
  }
  
  function Mass(x, y, mass, radius, angle, x_speed, y_speed, rotation_speed) {
    this.x = x;
    this.y = y;
    this.mass = mass || 1;
    this.radius = radius || 50;
    this.angle = angle || 0;
    this.x_speed = x_speed || 0;
    this.y_speed = y_speed || 0;
    this.rotation_speed = rotation_speed || 0;
  }
  
  function Asteroid(x, y, mass, x_speed, y_speed, rotation_speed) {
  
    var density = 1; // kg per square pixel
    var radius = Math.sqrt((mass / density) / Math.PI);
    this.super(x, y, mass, radius, 0, x_speed, y_speed, rotation_speed);
    this.circumference = 2 * Math.PI * this.radius;
    this.segments = Math.ceil(this.circumference / 15);
    this.segments = Math.min(25, Math.max(5, this.segments));
    this.noise = 0.2;
    this.shape = [];
    for(var i = 0; i < this.segments; i++) {
      this.shape.push(2 * (Math.random() - 0.5));
    }
  }
  extend(Asteroid, Mass);
  
  
  function AsteroidsGame(id) {
    this.canvas = document.getElementById(id);
    this.c = this.canvas.getContext("2d");
    this.canvas.focus();
    this.guide = false;
    this.ship_mass = 10;
    this.ship_radius = 15;
    this.asteroid_push = 10000000; // max force to apply in one frame
    this.ship = new Ship(this.canvas.width / 2, this.canvas.height / 2, 10, 15, 1000, 200);
    this.projectiles = [];
    this.asteroids = [];
    this.score_indicator = new NumberIndicator(
  
      "score",
      this.canvas.width - 10,
      5
    );
    this.fps_indicator = new NumberIndicator(
      "fps",
      this.canvas.width - 10,
      this.canvas.height - 15,
      {digits: 0}
    );
    for(var i = 0; i < 4; i++){
      this.asteroids.push(this.moving_asteroid());
      this.health_indicator = new Indicator("health", 5, 5, 100, 10);
      this.mass_destroyed = 500;
      this.score = 0;
  
    }
    this.canvas.addEventListener("keydown", this.keyDown.bind(this), true);
    this.canvas.addEventListener("keyup", this.keyUp.bind(this), true);
    window.requestAnimationFrame(this.frame.bind(this));
  }
  
  
  function collision(obj1, obj2) {
    return distance_between(obj1, obj2) < (obj1.radius + obj2.radius);
  }
  function distance_between(obj1, obj2) {
    return Math.sqrt(Math.pow(obj1.x - obj2.x, 2) + Math.pow(obj1.y - obj2.y, 2));
  }
  
  
  function drawGrid(ctx, minor, major, stroke, fill) {
    minor = minor || 10;
    major = major || minor * 5;
    stroke = stroke || "#00FF00";
    fill = fill || "#009900";
    ctx.save();
    ctx.strokeStyle = stroke;
    ctx.fillStyle = fill;
    let width = ctx.canvas.width, height = ctx.canvas.height
    for(var x = 0; x< width; x += minor) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.lineWidth = (x % major == 0) ? 0.5 : 0.25;
      ctx.stroke();
      if(x % major == 0 ) {
        ctx.fillText(x, x, 10);
      }
    }
    for(var y = 0; y < height; y += minor) {
      ctx.beginPath(); ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.lineWidth = (y % major == 0) ? 0.5 : 0.25;
      ctx.stroke();
      if(y % major == 0 ) {
        ctx.fillText(y, 0, y + 10);
      }
    }
    ctx.restore();
  }
  
  
  
  function drawShip(ctx, radius, options) { 
    options = options || {}; 
    let angle = (options.angle || 0.5 * Math.PI) / 2; 
    if(options.thruster) {
      ctx.save();
      ctx.strokeStyle = "yellow";
      ctx.fillStyle = "red";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(
        Math.cos(Math.PI + angle * 0.8) * radius / 2,
        Math.sin(Math.PI + angle * 0.8) * radius / 2
      );
      ctx.quadraticCurveTo( -radius * 2, 0,
                           Math.cos(Math.PI - angle * 0.8) * radius / 2,
                           Math.sin(Math.PI - angle * 0.8) * radius / 2
                          );
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    }
    // Now we have two curve arguments 
    let curve1 = options.curve1 || 0.25; 
    let curve2 = options.curve2 || 0.75; 
    ctx.save(); 
    if(options.guide) { 
      ctx.strokeStyle = "white"; 
      ctx.fillStyle = "rgba(0, 0, 0, 0.25)"; 
      ctx.lineWidth = 0.5; 
      ctx.beginPath(); 
      ctx.arc(0, 0, radius, 0, 2 * Math.PI); 
      ctx.stroke(); 
      ctx.fill(); 
    }
    ctx.lineWidth = options.lineWidth || 2; 
    ctx.strokeStyle = options.stroke || "white"; 
    ctx.fillStyle = options.fill || "blue"; 
    ctx.beginPath(); ctx.moveTo(radius, 0); 
    // here we have the three curves 
    ctx.quadraticCurveTo(
      Math.cos(angle) * radius * curve2, 
      Math.sin(angle) * radius * curve2, 
      Math.cos(Math.PI - angle) * radius, 
      Math.sin(Math.PI - angle) * radius 
    ); 
    ctx.quadraticCurveTo(
      -radius * curve1, 0, 
      Math.cos(Math.PI + angle) * radius, 
      Math.sin(Math.PI + angle) * radius 
    );
    ctx.quadraticCurveTo(
      Math.cos(-angle) * radius * curve2, 
      Math.sin(-angle) * radius * curve2, 
      radius, 0
    ); 
    ctx.fill(); 
    ctx.stroke(); 
    // the guide drawing code is getting complicated 
    if(options.guide) { 
      ctx.strokeStyle = "white"; 
      ctx.fillStyle = "white"; 
      ctx.lineWidth = 0.5; 
      ctx.beginPath(); 
      ctx.moveTo( 
        Math.cos(-angle) * radius, 
        Math.sin(-angle) * radius 
      ); 
      ctx.lineTo(0, 0); 
      ctx.lineTo( 
        Math.cos(angle) * radius, 
        Math.sin(angle) * radius 
      );
      ctx.moveTo(-radius, 0); 
      ctx.lineTo(0, 0); 
      ctx.stroke(); 
      ctx.beginPath(); 
      ctx.arc( 
        Math.cos(angle) * radius * curve2, 
        Math.sin(angle) * radius * curve2, 
        radius/40, 0, 2 * Math.PI 
      );
      ctx.fill(); 
      ctx.beginPath(); 
      ctx.arc(
        Math.cos(-angle) * radius * curve2, 
        Math.sin(-angle) * radius * curve2, 
        radius/40, 0, 2 * Math.PI 
      ); 
      ctx.fill(); 
      ctx.beginPath(); 
      ctx.arc(radius * curve1 - radius, 0, radius/50, 0, 2 * Math.PI); 
      ctx.fill(); 
    }
    ctx.restore(); 
  }
  
  
  
  function drawLine(ctx, obj1, obj2) {
    ctx.save();
    ctx.strokeStyle = "white";
    ctx.lineWidth = 0.5;
    ctx.beginPath();
    ctx.moveTo(obj1.x, obj1.y);
    ctx.lineTo(obj2.x, obj2.y);
    ctx.stroke();
    ctx.restore();
  }
  
  
  
  function drawAsteroid(ctx, radius, shape, options) {
    options = options || {};
    ctx.strokeStyle = options.stroke || "white";
    ctx.fillStyle = options.fill || "black";
    ctx.save();
    ctx.beginPath();
    for(let i = 0; i < shape.length; i++) {
      ctx.rotate(2 * Math.PI / shape.length);
      ctx.lineTo(radius + radius * options.noise * shape[i], 0);
    }
    ctx.closePath();
    ctx.fill(); ctx.stroke();
    if(options.guide) {
      ctx.lineWidth = 0.5;
      ctx.beginPath();
      ctx.arc(0, 0, radius, 0, 2 * Math.PI);
      ctx.stroke();
    }
    ctx.restore();
  }
  
  
  
  
  function draw(ctx) { 
    context.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height); 
    drawGrid(ctx); 
    asteroids.forEach(function(array_obj) { 
      array_obj.draw(ctx); 
    }); 
    ship.draw(ctx, true);
    projectiles.forEach(function(p) { 
      p.draw(ctx); 
    }); 
  }
  
  function drawProjectile(ctx, radius, lifetime) {
    ctx.save();
    // ctx.fillStyle = "rgb(100%, 100%, " + (100 * lifetime) + "%)";
    ctx.fillStyle = "rgba(220, 220, 20, " + (lifetime) + ")"; //← edited
    ctx.beginPath();
  
    ctx.arc(0, 0, radius, 0, 2 * Math.PI); // let's try this simple circle
    ctx.fill();
    ctx.closePath();
    ctx.restore();
  }
  
  
  
  
  
  
  function frame(timestamp) {
    if (!previous)
      previous = timestamp;
    var elapsed = timestamp - previous;
    context.clearRect(0, 0, context.canvas.width, context.canvas.height);
    update(elapsed/1000, context); 
    draw(context);
    previous = timestamp;
    window.requestAnimationFrame(frame);
  }
  
  function update(elapsed, ctx) { 
  
    asteroids.forEach(function(array_obj) { 
      array_obj.update(elapsed, ctx); 
    }); 
    ship.update(elapsed, ctx); 
    projectiles.forEach(function(projectile, i, projectiles) { 
      projectile.update(elapsed, context); 
      if(projectile.life <= 0) { 
        projectiles.splice(i, 1); 
      }
    });  
    if(ship.trigger && ship.loaded) { 
      projectiles.push(ship.projectile(elapsed)); 
    }
  }
  
  function Indicator(label, x, y, width, height) {
    this.label = label + ": ";
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
  }
  
  
  
  /*
  function key_handler(e, value) { 
    var nothing_handled = false; 
    switch(e.key || e.keyCode) { 
      case "ArrowUp": 
      case 38: // up arrow 
        ship.thruster_on = value; 
        break; 
      case "ArrowLeft": 
      case 37: // left arrow 
        ship.left_thruster = value; 
        break; 
      case "ArrowRight": 
      case 39: // right arrow 
        ship.right_thruster = value; 
        break; 
      case " ": 
      case 32: //spacebar 
        ship.trigger = value; 
        break; 
      case "g": 
      case 71:
        if(value) this.guide = !this.guide; 
      case "w":
      case 40:
        ship.angle = 3 * Math.PI / 2;
        ship.rotation_speed = 0;
        ship.x_speed = 0;
        ship.y_speed = 0;
        break;
      case "s":
      case 41:
        ship.angle = Math.PI / 2;
        ship.rotation_speed = 0;
        ship.x_speed = 0;
        ship.y_speed = 0;
        break;
      case "d":
      case 42:
        ship.angle = 0;
        ship.rotation_speed = 0;
        ship.x_speed = 0;
        ship.y_speed = 0;
        break;
      case "a":
      case 43:
        ship.angle = Math.PI;
        ship.x_speed = 0;
        ship.y_speed = 0;
        ship.rotation_speed = 0;
        break;
  
      default: 
        nothing_handled = true; 
    }
    if(!nothing_handled) 
      e.preventDefault(); 
  }
  */
  
  AsteroidsGame.prototype.key_handler = function(e, value) {
    var nothing_handled = false;
    switch(e.key || e.keyCode) {
      case "ArrowLeft":
      case 37: // left arrow
        this.ship.left_thruster = value;
        break;
      case "ArrowUp":
      case 38: // up arrow
        this.ship.thruster_on = value;
        break;
      case "ArrowRight":
      case 39: // right arrow
        this.ship.right_thruster = value;
        break;
      case "ArrowDown":
      case 40:
        this.ship.retro_on = value;
        break;
      case" ":
      case 32: //spacebar
        this.ship.trigger = value;
        break;
  
      case "g":
      case 71: // g for guide
        if(value) this.guide = !this.guide;
        break;
      case "w":
      case 40:
        this.ship.angle = 3 * Math.PI / 2;
        this.ship.rotation_speed = 0;
        this.ship.x_speed = 0;
        this.ship.y_speed = 0;
        break;
      case "s":
      case 41:
        this.ship.angle = Math.PI / 2;
        this.ship.rotation_speed = 0;
        this.ship.x_speed = 0;
        this.ship.y_speed = 0;
        break;
      case "d":
      case 42:
        this.ship.angle = 0;
        this.ship.rotation_speed = 0;
        this.ship.x_speed = 0;
        this.ship.y_speed = 0;
        break;
      case "a":
      case 43:
        this.ship.angle = Math.PI;
        this.ship.x_speed = 0;
        this.ship.y_speed = 0;
        this.ship.rotation_speed = 0;
        break;
      default:
        nothing_handled = true;
    }
    if(!nothing_handled) e.preventDefault();
  }
  
  
  
  
  function Ship(x, y, mass, radius, power, weapon_power) {
    this.super(x, y, mass, radius, 1.5 * Math.PI);
    this.thruster_power = power;
    this.steering_power = this.thruster_power / 20;
    this.right_thruster = false;
    this.left_thruster = false;
    this.thruster_on = false;
    this.weapon_power = weapon_power || 200;
    this.loaded = false;
    this.weapon_reload_time = 0.125; // seconds
    this.time_until_reloaded = this.weapon_reload_time;
    this.compromised = false;
    this.max_health = 2.0;
    this.health = this.max_health;
  }
  extend(Ship, Mass);
  
  
  function Projectile(x, y, mass, lifetime, x_speed, y_speed, rotation_speed) {
    var density = 0.005; // low density means we can see very light projectiles
    var radius = Math.sqrt((5 * mass / density) / Math.PI);
    this.super (x, y, mass, radius, 0, x_speed, y_speed, rotation_speed);
    this.lifetime = lifetime;
    this.life = 1.0;
  }
  
  extend(Projectile, Mass);
  
  
  
  Mass.prototype.update = function(elapsed, ctx) {
  
    this.x += this.x_speed * elapsed;
    this.y += this.y_speed * elapsed;
    this.angle += this.rotation_speed * elapsed;
    this.angle %= (2 * Math.PI);
    if(this.x - this.radius > ctx.canvas.width) {
      this.x = -this.radius;
    }
    if(this.x + this.radius < 0) {
      this.x = ctx.canvas.width + this.radius;
    }
    if(this.y - this.radius > ctx.canvas.height) {
      this.y = -this.radius;
    }
    if(this.y + this.radius < 0) {
      this.y = ctx.canvas.height + this.radius;
    }
  } 
  
  
  
  Mass.prototype.push = function(angle, force, elapsed) {
    this.x_speed += elapsed * (Math.cos(angle) * force) / this. mass;
    this.y_speed += elapsed * (Math.sin(angle) * force) / this. mass;
  }
  
  Mass.prototype.twist = function(force, elapsed) {
    this.rotation_speed += elapsed * force / this.mass;
  }
  
  Mass.prototype.speed = function() {
    return Math.sqrt(Math.pow(this.x_speed, 2) + Math.pow(this.y_speed, 2));
  }
  Mass.prototype.movement_angle = function() {
    return Math.atan2(this.y_speed, this.x_speed);
  }
  
  Mass.prototype.draw = function(c) {
    c.save();
    c.translate(this.x, this.y);
    c.rotate(this.angle);
    c.beginPath();
    c.arc(0, 0, this.radius, 0, 2 * Math.PI);
    c.lineTo(0, 0);
    c.strokeStyle = "#FFFFFF";
    c.stroke();
    c.restore();
  }
  
  Asteroid.prototype.draw = function(ctx, guide) { 
    ctx.save(); 
    ctx.translate(this.x, this.y); 
    ctx.rotate(this.angle); 
    drawAsteroid(ctx, this.radius, this.shape, { noise: this.noise, guide: guide }); 
    ctx.restore(); 
  }
  
  Asteroid.prototype.child = function(mass) {
  
    return new Asteroid(
      this.x, this.y, mass, this.x_speed, this.y_speed,
      this.rotation_speed
    )
  }
  
  
  
  
  Ship.prototype.draw = function(c, guide) {
    c.save();
    c.translate(this.x, this.y);
    c.rotate(this.angle);
  
    if(guide && this.compromised) {
      c.save();
      c.fillStyle = "red";
      c.beginPath();
      c.arc(0, 0, this.radius, 0, 2 * Math.PI);
      c.fill();
      c.restore();
    }
    drawShip(c, this.radius, { guide: guide, thruster: this.thruster_on });
    c.restore();
  }
  
  
  Ship.prototype.update = function(elapsed) {
  
    this.push(this.angle, this.thruster_on * this.thruster_power, elapsed);
    this.twist((this.right_thruster - this.left_thruster) * this.steering_power, elapsed);
  
    this.loaded = this.time_until_reloaded === 0;
    if(!this.loaded) {
      this.time_until_reloaded -= Math.min(elapsed, this.time_until_reloaded);
    }
    if(this.compromised) {
      this.health -= Math.min(elapsed, this.health);
    }
    Mass.prototype.update.apply(this, arguments);
  }
  
  
  Ship.prototype.projectile = function(elapsed) {
    var p = new Projectile(
      this.x + Math.cos(this.angle) * this.radius,
      this.y + Math.sin(this.angle) * this.radius,
      0.025,
      1,
      this.x_speed,
      this.y_speed,
      this.rotation_speed
    );
    p.push(this.angle, this.weapon_power, elapsed);
    this.push(this.angle + Math.PI, this.weapon_power, elapsed);
    return p;
    this.time_until_reloaded = this.weapon_reload_time;
  }
  
  
  Projectile.prototype.update = function(elapsed, c) { 
    this.life -= (elapsed / this.lifetime); 
    Mass.prototype.update.apply(this, arguments); 
  }
  
  Projectile.prototype.draw = function(c, guide) {
    c.save();
    c.translate(this.x, this.y);
    c.rotate(this.angle);
    drawProjectile(c, this.radius, this.life, guide);
    c.restore();
  }
  
  
  
  AsteroidsGame.prototype.moving_asteroid = function(elapsed) {
    var asteroid = this.new_asteroid();
    this.push_asteroid(asteroid, elapsed);
    return asteroid;
  }
  
  AsteroidsGame.prototype.new_asteroid = function() {
    return new Asteroid(
      this.canvas.width * Math.random(),
      this.canvas.height * Math.random(),
      2000 + Math.random() * 8000 // Mass of asteroids
    );
  }
  
  AsteroidsGame.prototype.push_asteroid = function(asteroid, elapsed) {
    elapsed = elapsed || 0.15;
    var temp = Math.random() - 0.5;
    if(temp > 0)
      temp += 0.15;
    else
      temp -= 0.15;
    asteroid.push(
      2 * Math.PI * Math.random(),
      temp * this.asteroid_push,
      elapsed
    );
  
  
    asteroid.twist( (Math.random() - 0.5) * Math.PI * this.asteroid_push * 0.01, elapsed );
  }
  
  AsteroidsGame.prototype.keyDown = function(e) {
    this.key_handler(e, true);
  }
  AsteroidsGame.prototype.keyUp = function(e) {
    this.key_handler(e, false);
  }
  
  AsteroidsGame.prototype.frame = function(timestamp) {
    if (!this.previous) this.previous = timestamp;
    var elapsed = timestamp - this.previous;
    this.fps = 1000 / elapsed;
    this.update(elapsed / 1000);
    this.draw();
    this.previous = timestamp;
    window.requestAnimationFrame(this.frame.bind(this));
  }
  
  
  AsteroidsGame.prototype.update = function(elapsed) {
    this.ship.compromised = false;
    this.asteroids.forEach(function(asteroid) {
      asteroid.update(elapsed, this.c);
      if(collision(asteroid, this.ship)) {
        this.ship.compromised = true;
      }
    }, this);
    this.ship.update(elapsed, this.c);
    this.projectiles.forEach(function(p, i, projectiles) {
      p.update(elapsed, this.c);
      if(p.life <= 0) {
        projectiles.splice(i, 1);
      } else {
        this.asteroids.forEach(function(asteroid, j) {
          if(collision (asteroid, p)) {
            projectiles.splice(i, 1);
            this.asteroids.splice(j, 1);
            this.split_asteroid(asteroid, elapsed);
          }
        }, this);
      }
    }, this);
    if(this.ship.trigger && this.ship.loaded) {
      this.projectiles.push(this.ship.projectile(elapsed));
  
    }
  }
  
  AsteroidsGame.prototype.draw = function() {
    this.c.clearRect(0, 0, this.canvas.width, this.canvas.height);
    drawGrid(this.c);
    if(this.guide) {
      this.asteroids.forEach(function(asteroid) {
        drawLine(this.c, asteroid, this.ship);
      }, this);
      this.fps_indicator.draw(this.c, this.fps);
    }
    this.asteroids.forEach(function(asteroid) {
      asteroid.draw(this.c, this.guide);
    }, this);
    this.ship.draw(this.c, this.guide);
    this.projectiles.forEach(function(p) {
      p.draw(this.c);
    }, this);
    this.health_indicator.draw(this.c, this.ship.health, this.ship.max_health);
    this.score_indicator.draw(this.c, this.score);
  }
  
  
  Indicator.prototype.draw = function(c, max, level) {
    c.save();
    c.strokeStyle = "white";
    c.fillStyle = "white";
    c.font = this.height + "pt Arial";
    var offset = c.measureText(this.label).width;
    c.fillText(this.label, this.x, this.y + this.height - 1);
    c.beginPath();
    c.rect(offset + this.x, this.y, this.width, this.height);
    c.stroke();
    c.beginPath();
    c.rect(offset + this.x, this.y, this.width * (max / level), this.height);
    c.fill();
    c.restore();
  }
  
  
  AsteroidsGame.prototype.split_asteroid = function(asteroid, elapsed) {
    asteroid.mass -= this.mass_destroyed;
    this.score += this.mass_destroyed;
    var split = 0.25 + 0.5 * Math.random(); // split unevenly
    var ch1 = asteroid.child(asteroid.mass * split);
    var ch2 = asteroid.child(asteroid.mass * (1 - split));
    [ch1, ch2].forEach(function(child) {
      if(child.mass < this.mass_destroyed) {
        this.score += child.mass;
      } else {
        this.push_asteroid(child, elapsed);
        this.asteroids.push(child); // add the child to the array list
      }
    }, this);
  }
  
  
  
  function NumberIndicator(label, x, y, options) {
    options = options || {}
    this.label = label + ": ";
    this.x = x;
    this.y = y;
    this.digits = options.digits || 0;
    this.pt = options.pt || 10;
    this.align = options.align || 'end';
  }
  NumberIndicator.prototype.draw = function(c, value) {
    c.save();
    c.fillStyle = "white";
    c.font = this.pt + "pt Arial";
    c.textAlign = this.align;
    c.fillText( this.label + value.toFixed(this.digits), this.x, this.y + this.pt - 1 );
    c.restore();
  }
  
  
  
  