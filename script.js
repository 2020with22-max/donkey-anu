// Mobile Menu Functionality
const hamburger = document.getElementById('hamburger');
const navLinks = document.getElementById('navLinks');

function toggleMobileMenu() {
    hamburger.classList.toggle('active');
    navLinks.classList.toggle('active');
}

function closeMobileMenu() {
    hamburger.classList.remove('active');
    navLinks.classList.remove('active');
    
    // Close all dropdowns
    document.querySelectorAll('.dropdown').forEach(dropdown => {
        dropdown.classList.remove('active');
    });
}

function toggleDropdown(dropdownId) {
    if (window.innerWidth <= 768) {
        const dropdown = document.getElementById(dropdownId);
        dropdown.classList.toggle('active');
    }
}

hamburger.addEventListener('click', toggleMobileMenu);

// Close mobile menu when clicking outside
document.addEventListener('click', function(event) {
    if (window.innerWidth <= 768) {
        if (!event.target.closest('.nav-container')) {
            closeMobileMenu();
        }
    }
});

// Close mobile menu when clicking on a link
document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', closeMobileMenu);
});

// Game Variables
let game = {
    score: 0,
    timeLeft: 60,
    isPlaying: false,
    characterX: 250,
    characterY: 250,
    mouseX: 250,
    mouseY: 250,
    treasures: [],
    gameLoop: null,
    timerInterval: null,
    spawnInterval: null
};

// Character messages
const characterMessages = [
    "Hi! I'm Data Bot! 🤖",
    "Let's find some data! 💎",
    "Yay! Treasure! ⭐",
    "I love data science! 📊",
    "Keep going! 💪",
    "You're doing great! 🎉",
    "Data is everywhere! 🔍",
    "Thanks for helping! 🙏",
    "Let's explore more! 🚀",
    "Finding patterns is fun! 🎯"
];

// Game Functions
function initGame() {
    const canvas = document.getElementById('gameCanvas');
    const character = document.getElementById('gameCharacter');
    
    // Mouse move handler
    canvas.addEventListener('mousemove', (e) => {
        const rect = canvas.getBoundingClientRect();
        game.mouseX = e.clientX - rect.left;
        game.mouseY = e.clientY - rect.top;
    });

    // Touch move handler for mobile
    canvas.addEventListener('touchmove', (e) => {
        e.preventDefault();
        const rect = canvas.getBoundingClientRect();
        game.mouseX = e.touches[0].clientX - rect.left;
        game.mouseY = e.touches[0].clientY - rect.top;
    });

    // Click on Character for emoji reaction
    character.addEventListener('click', (e) => {
        e.stopPropagation();
        showCharacterMessage();
        createParticles(game.characterX, game.characterY);
    });

    // Canvas click to start game
    canvas.addEventListener('click', (e) => {
        if (!game.isPlaying) {
            startGame();
        }
    });

    // Start game automatically
    setTimeout(() => {
        startGame();
    }, 1000);
}

function startGame() {
    if (game.isPlaying) return;
    
    game.isPlaying = true;
    game.score = 0;
    game.timeLeft = 60;
    
    updateGameUI();
    
    // Start game loop with requestAnimationFrame
    game.gameLoop = requestAnimationFrame(updateGame);
    
    // Start timer
    game.timerInterval = setInterval(() => {
        game.timeLeft--;
        document.getElementById('gameTimer').textContent = game.timeLeft;
        
        if (game.timeLeft <= 0) {
            endGame();
        }
    }, 1000);
    
    // Start spawning treasures
    spawnTreasures();
    game.spawnInterval = setInterval(spawnTreasures, 2000);
}

function updateGame() {
    if (!game.isPlaying) return;
    const character = document.getElementById('gameCharacter');
    
    // Smooth character movement towards mouse
    const dx = game.mouseX - game.characterX;
    const dy = game.mouseY - game.characterY;
    
    // MODIFIED: Changed interpolation factor from 0.3 to 0.12 for smoother movement
    game.characterX += dx * 0.12;
    game.characterY += dy * 0.12;
    
    // Update character position
    character.style.left = `${game.characterX}px`;
    character.style.top = `${game.characterY}px`;
    
    // Update eye tracking
    updateCharacterEyes();
    
    // Check collisions
    checkCollisions();
    
    // Continue the loop
    game.gameLoop = requestAnimationFrame(updateGame);
}

function updateCharacterEyes() {
    const pupils = document.querySelectorAll('.character-pupil');
    const characterRect = document.getElementById('gameCharacter').getBoundingClientRect();
    const canvasRect = document.getElementById('gameCanvas').getBoundingClientRect();
    
    pupils.forEach((pupil) => {
        const eye = pupil.parentElement;
        const eyeRect = eye.getBoundingClientRect();
        const eyeCenterX = eyeRect.left + eyeRect.width / 2 - canvasRect.left;
        const eyeCenterY = eyeRect.top + eyeRect.height / 2 - canvasRect.top;
        
        const angle = Math.atan2(game.mouseY - eyeCenterY, game.mouseX - eyeCenterX);
        const distance = Math.min(3, Math.hypot(game.mouseX - eyeCenterX, game.mouseY - eyeCenterY) / 20);
        
        const pupilX = Math.cos(angle) * distance;
        const pupilY = Math.sin(angle) * distance;
        
        pupil.style.transform = `translate(calc(-50% + ${pupilX}px), calc(-50% + ${pupilY}px))`;
    });
}

function showCharacterMessage() {
    const bubble = document.getElementById('characterBubble');
    const message = characterMessages[Math.floor(Math.random() * characterMessages.length)];
    
    bubble.textContent = message;
    bubble.style.left = game.characterX + 50 + 'px';
    bubble.style.top = game.characterY - 30 + 'px';
    bubble.classList.add('show');
    
    setTimeout(() => {
        bubble.classList.remove('show');
    }, 3000);
}

function createParticles(x, y) {
    for (let i = 0; i < 8; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle-effect';
        particle.style.left = x + 'px';
        particle.style.top = y + 'px';
        particle.style.transform = `rotate(${i * 45}deg) translateX(${Math.random() * 20}px)`;
        
        document.getElementById('gameCanvas').appendChild(particle);
        
        setTimeout(() => particle.remove(), 1000);
    }
}

function spawnTreasures() {
    const canvas = document.getElementById('gameCanvas');
    const treasureTypes = ['gem', 'coin', 'star'];
    
    if (game.treasures.length < 8) {
        const type = treasureTypes[Math.floor(Math.random() * treasureTypes.length)];
        const treasure = document.createElement('div');
        treasure.className = 'data-treasure';
        treasure.dataset.type = type;
        treasure.dataset.value = type === 'gem' ? 20 : type === 'coin' ? 10 : 30;
        
        const treasureInner = document.createElement('div');
        treasureInner.className = `treasure-${type}`;
        if (type === 'coin') {
            treasureInner.textContent = '$';
        }
        
        treasure.appendChild(treasureInner);
        treasure.style.left = Math.random() * (canvas.offsetWidth - 40) + 'px';
        treasure.style.top = Math.random() * (canvas.offsetHeight - 40) + 'px';
        
        canvas.appendChild(treasure);
        game.treasures.push(treasure);
    }
}

function checkCollisions() {
    const characterRect = {
        x: game.characterX - 40,
        y: game.characterY - 40,
        width: 80,
        height: 80
    };
    
    game.treasures = game.treasures.filter(treasure => {
        const treasureRect = treasure.getBoundingClientRect();
        const canvasRect = document.getElementById('gameCanvas').getBoundingClientRect();
        const treasureRelative = {
            x: treasureRect.left - canvasRect.left,
            y: treasureRect.top - canvasRect.top,
            width: 40,
            height: 40
        };
        
        if (isColliding(characterRect, treasureRelative)) {
            const value = parseInt(treasure.dataset.value);
            game.score += value;
            createParticles(treasureRelative.x + 20, treasureRelative.y + 20);
            
            // Show happy message
            const messages = {
                gem: "Wow! A gem! 💎",
                coin: "Money! 🪙",
                star: "A star! ⭐"
            };
            const bubble = document.getElementById('characterBubble');
            bubble.textContent = messages[treasure.dataset.type];
            bubble.style.left = game.characterX + 50 + 'px';
            bubble.style.top = game.characterY - 30 + 'px';
            bubble.classList.add('show');
            setTimeout(() => bubble.classList.remove('show'), 2000);
            
            treasure.remove();
            updateGameUI();
            return false;
        }
        return true;
    });
}

function isColliding(rect1, rect2) {
    return rect1.x < rect2.x + rect2.width &&
           rect1.x + rect1.width > rect2.x &&
           rect1.y < rect2.y + rect2.height &&
           rect1.y + rect1.height > rect2.y;
}

function updateGameUI() {
    document.getElementById('gameScore').textContent = game.score;
}

function endGame() {
    game.isPlaying = false;
    // MODIFIED: Cancel the animation frame loop
    cancelAnimationFrame(game.gameLoop);
    clearInterval(game.timerInterval);
    clearInterval(game.spawnInterval);
    
    // Clear all treasures
    game.treasures.forEach(treasure => treasure.remove());
    game.treasures = [];
    
    // Show final message
    const bubble = document.getElementById('characterBubble');
    bubble.textContent = `Game Over! Score: ${game.score} 🎉`;
    bubble.style.left = '50%';
    bubble.style.top = '50%';
    bubble.style.transform = 'translate(-50%, -50%)';
    bubble.style.width = '200px';
    bubble.classList.add('show');
    
    setTimeout(() => {
        bubble.classList.remove('show');
        bubble.style.transform = '';
        bubble.style.width = '';
        // Restart game
        setTimeout(() => {
            game.score = 0;
            game.timeLeft = 60;
            updateGameUI();
            startGame();
        }, 2000);
    }, 5000);
}

// Enhanced Three.js Hero Background Animation
let heroScene, heroCamera, heroRenderer;
let particles = [];
let particleCount = 200;
let dataStreams = [];

function initHeroBackground() {
    const container = document.getElementById('threejs-container');
    
    heroScene = new THREE.Scene();
    heroCamera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    heroRenderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    heroRenderer.setSize(window.innerWidth, window.innerHeight);
    heroRenderer.setClearColor(0x000000, 0);
    container.appendChild(heroRenderer.domElement);

    // Create enhanced particle system
    const geometry = new THREE.BufferGeometry();
    const positions = [];
    const colors = [];
    const sizes = [];

    for (let i = 0; i < particleCount; i++) {
        positions.push(
            (Math.random() - 0.5) * 30,
            (Math.random() - 0.5) * 30,
            (Math.random() - 0.5) * 30
        );
        
        const color = new THREE.Color();
        color.setHSL(Math.random() * 0.3 + 0.5, 0.8, 0.9);
        colors.push(color.r, color.g, color.b);
        
        sizes.push(Math.random() * 0.3 + 0.1);
    }

    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    geometry.setAttribute('size', new THREE.Float32BufferAttribute(sizes, 1));

    const material = new THREE.PointsMaterial({
        size: 0.2,
        vertexColors: true,
        transparent: true,
        opacity: 0.8,
        blending: THREE.AdditiveBlending,
        sizeAttenuation: true
    });

    const particleSystem = new THREE.Points(geometry, material);
    heroScene.add(particleSystem);

    // Create data streams (connecting lines)
    for (let i = 0; i < 20; i++) {
        const points = [];
        for (let j = 0; j < 10; j++) {
            points.push(new THREE.Vector3(
                (Math.random() - 0.5) * 20,
                (Math.random() - 0.5) * 20,
                (Math.random() - 0.5) * 20
            ));
        }
        
        const lineGeometry = new THREE.BufferGeometry().setFromPoints(points);
        const lineMaterial = new THREE.LineBasicMaterial({
            color: new THREE.Color().setHSL(Math.random(), 0.7, 0.8),
            transparent: true,
            opacity: 0.3
        });
        
        const line = new THREE.Line(lineGeometry, lineMaterial);
        dataStreams.push(line);
        heroScene.add(line);
    }

    // Add floating cubes
    for (let i = 0; i < 10; i++) {
        const geometry = new THREE.BoxGeometry(0.5, 0.5, 0.5);
        const material = new THREE.MeshPhongMaterial({
            color: new THREE.Color().setHSL(Math.random(), 0.7, 0.6),
            emissive: new THREE.Color().setHSL(Math.random(), 0.7, 0.6),
            emissiveIntensity: 0.2,
            transparent: true,
            opacity: 0.7
        });
        
        const cube = new THREE.Mesh(geometry, material);
        cube.position.set(
            (Math.random() - 0.5) * 25,
            (Math.random() - 0.5) * 25,
            (Math.random() - 0.5) * 25
        );
        cube.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
        
        particles.push(cube);
        heroScene.add(cube);
    }

    heroCamera.position.z = 8;

    function animateHero() {
        requestAnimationFrame(animateHero);
        
        // Animate particles
        particleSystem.rotation.x += 0.0005;
        particleSystem.rotation.y += 0.001;
        
        const positions = geometry.attributes.position.array;
        for (let i = 0; i < positions.length; i += 3) {
            positions[i + 1] += Math.sin(Date.now() * 0.001 + i) * 0.002;
        }
        geometry.attributes.position.needsUpdate = true;

        // Animate data streams
        dataStreams.forEach((stream, index) => {
            stream.rotation.x += 0.001 * (index % 2 === 0 ? 1 : -1);
            stream.rotation.y += 0.002 * (index % 3 === 0 ? 1 : -1);
        });

        // Animate floating cubes
        particles.forEach((cube, index) => {
            cube.rotation.x += 0.01;
            cube.rotation.y += 0.01;
            cube.position.y += Math.sin(Date.now() * 0.001 + index) * 0.01;
        });

        heroRenderer.render(heroScene, heroCamera);
    }

    animateHero();
}

// 3D Data Visualization
let dataScene, dataCamera, dataRenderer;
let currentVisualization = 'particles';
let dataVizObjects = [];

function initDataVisualization() {
    const container = document.getElementById('data-viz-container');
    
    dataScene = new THREE.Scene();
    dataScene.background = new THREE.Color(0xf0f0f0);
    
    dataCamera = new THREE.PerspectiveCamera(75, container.offsetWidth / container.offsetHeight, 0.1, 1000);
    dataCamera.position.set(0, 5, 10);
    
    dataRenderer = new THREE.WebGLRenderer({ antialias: true });
    dataRenderer.setSize(container.offsetWidth, container.offsetHeight);
    dataRenderer.shadowMap.enabled = true;
    dataRenderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(dataRenderer.domElement);

    // Enhanced lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    dataScene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(10, 10, 5);
    directionalLight.castShadow = true;
    dataScene.add(directionalLight);

    const pointLight = new THREE.PointLight(0x4a6cf7, 1, 100);
    pointLight.position.set(0, 10, 0);
    dataScene.add(pointLight);

    // Grid
    const gridHelper = new THREE.GridHelper(20, 20, 0x888888, 0xcccccc);
    dataScene.add(gridHelper);

    createParticlesVisualization();
    animateDataViz();
}

function createParticlesVisualization() {
    clearVisualization();
    
    const geometry = new THREE.BufferGeometry();
    const positions = [];
    const colors = [];
    const sizes = [];
    
    for (let i = 0; i < 1000; i++) {
        positions.push(
            (Math.random() - 0.5) * 15,
            Math.random() * 8,
            (Math.random() - 0.5) * 15
        );
        
        const color = new THREE.Color();
        color.setHSL(Math.random(), 0.8, 0.6);
        colors.push(color.r, color.g, color.b);
        
        sizes.push(Math.random() * 0.3 + 0.1);
    }
    
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    geometry.setAttribute('size', new THREE.Float32BufferAttribute(sizes, 1));
    
    const material = new THREE.PointsMaterial({
        size: 0.2,
        vertexColors: true,
        sizeAttenuation: true,
        transparent: true,
        opacity: 0.8,
        blending: THREE.AdditiveBlending
    });
    
    const points = new THREE.Points(geometry, material);
    dataVizObjects.push(points);
    dataScene.add(points);
}

function createBarsVisualization() {
    clearVisualization();
    
    const barData = [
        { height: 3, color: 0x4a6cf7 },
        { height: 5, color: 0x6c63ff },
        { height: 2, color: 0xff6b6b },
        { height: 4, color: 0x4ecdc4 },
        { height: 3.5, color: 0xffe66d },
        { height: 2.5, color: 0xa8e6cf },
        { height: 4.5, color: 0xffd3b6 },
        { height: 3, color: 0xffaaa5 },
        { height: 4, color: 0x8b5cf6 },
        { height: 2.8, color: 0x10b981 }
    ];
    
    barData.forEach((data, index) => {
        const geometry = new THREE.BoxGeometry(0.8, data.height, 0.8);
        const material = new THREE.MeshPhongMaterial({ 
            color: data.color,
            emissive: data.color,
            emissiveIntensity: 0.3,
            transparent: true,
            opacity: 0.9
        });
        const bar = new THREE.Mesh(geometry, material);
        bar.position.x = (index - barData.length / 2) * 1.2;
        bar.position.y = data.height / 2;
        bar.castShadow = true;
        bar.receiveShadow = true;
        dataVizObjects.push(bar);
        dataScene.add(bar);
    });
}

function createSphereVisualization() {
    clearVisualization();
    
    // Main sphere
    const geometry = new THREE.SphereGeometry(3, 32, 32);
    const material = new THREE.MeshPhongMaterial({
        color: 0x4a6cf7,
        wireframe: true,
        emissive: 0x4a6cf7,
        emissiveIntensity: 0.2,
        transparent: true,
        opacity: 0.8
    });
    const sphere = new THREE.Mesh(geometry, material);
    dataVizObjects.push(sphere);
    dataScene.add(sphere);
    
    // Orbiting data points
    for (let i = 0; i < 100; i++) {
        const pointGeometry = new THREE.SphereGeometry(0.1, 8, 8);
        const pointMaterial = new THREE.MeshPhongMaterial({
            color: new THREE.Color().setHSL(i / 100, 0.8, 0.6),
            emissive: new THREE.Color().setHSL(i / 100, 0.8, 0.6),
            emissiveIntensity: 0.5
        });
        const point = new THREE.Mesh(pointGeometry, pointMaterial);
        
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);
        const radius = 3.5 + Math.random() * 2;
        
        point.position.x = radius * Math.sin(phi) * Math.cos(theta);
        point.position.y = radius * Math.sin(phi) * Math.sin(theta);
        point.position.z = radius * Math.cos(phi);
        
        point.userData = { 
            originalRadius: radius,
            speed: Math.random() * 0.02 + 0.01,
            angle: Math.random() * Math.PI * 2
        };
        
        dataVizObjects.push(point);
        dataScene.add(point);
    }
}

function createNetworkVisualization() {
    clearVisualization();
    
    const nodes = [];
    const nodeCount = 30;
    
    // Create nodes
    for (let i = 0; i < nodeCount; i++) {
        const geometry = new THREE.SphereGeometry(0.3, 16, 16);
        const material = new THREE.MeshPhongMaterial({
            color: new THREE.Color().setHSL(i / nodeCount, 0.8, 0.6),
            emissive: new THREE.Color().setHSL(i / nodeCount, 0.8, 0.6),
            emissiveIntensity: 0.4
        });
        const node = new THREE.Mesh(geometry, material);
        
        node.position.x = (Math.random() - 0.5) * 10;
        node.position.y = (Math.random() - 0.5) * 8;
        node.position.z = (Math.random() - 0.5) * 10;
        
        node.userData = {
            originalPosition: node.position.clone(),
            floatSpeed: Math.random() * 0.02 + 0.01,
            floatOffset: Math.random() * Math.PI * 2
        };
        
        nodes.push(node);
        dataVizObjects.push(node);
        dataScene.add(node);
    }
    
    // Create connections
    for (let i = 0; i < nodeCount; i++) {
        for (let j = i + 1; j < nodeCount; j++) {
            const distance = nodes[i].position.distanceTo(nodes[j].position);
            if (distance < 5 && Math.random() > 0.5) {
                const points = [];
                points.push(nodes[i].position);
                points.push(nodes[j].position);
                
                const geometry = new THREE.BufferGeometry().setFromPoints(points);
                const material = new THREE.LineBasicMaterial({ 
                    color: 0x888888,
                    transparent: true,
                    opacity: 0.6
                });
                const line = new THREE.Line(geometry, material);
                dataVizObjects.push(line);
                dataScene.add(line);
            }
        }
    }
}

function clearVisualization() {
    dataVizObjects.forEach(obj => {
        dataScene.remove(obj);
        if (obj.geometry) obj.geometry.dispose();
        if (obj.material) obj.material.dispose();
    });
    dataVizObjects = [];
}

function switchVisualization(type) {
    currentVisualization = type;
    
    // Update button states
    document.querySelectorAll('.viz-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
    
    switch(type) {
        case 'particles':
            createParticlesVisualization();
            break;
        case 'bars':
            createBarsVisualization();
            break;
        case 'sphere':
            createSphereVisualization();
            break;
        case 'network':
            createNetworkVisualization();
            break;
    }
}

function animateDataViz() {
    requestAnimationFrame(animateDataViz);
    
    // Rotate camera around the scene
    const time = Date.now() * 0.0005;
    dataCamera.position.x = Math.cos(time) * 15;
    dataCamera.position.z = Math.sin(time) * 15;
    dataCamera.lookAt(0, 0, 0);
    
    // Animate objects
    dataVizObjects.forEach((obj, index) => {
        if (obj.type === 'Points') {
            obj.rotation.y += 0.002;
        } else if (obj.type === 'Mesh' && obj.geometry.type === 'BoxGeometry') {
            obj.rotation.y += 0.01;
            obj.position.y = Math.abs(Math.sin(time + index)) * 2 + obj.geometry.parameters.height / 2;
        } else if (obj.type === 'Mesh' && obj.geometry.type === 'SphereGeometry') {
            if (obj.userData.originalRadius) {
                // Orbiting points
                obj.userData.angle += obj.userData.speed;
                obj.position.x = obj.userData.originalRadius * Math.cos(obj.userData.angle);
                obj.position.z = obj.userData.originalRadius * Math.sin(obj.userData.angle);
            } else {
                // Main sphere
                obj.rotation.x += 0.005;
                obj.rotation.y += 0.005;
            }
        } else if (obj.userData && obj.userData.originalPosition) {
            // Network nodes floating
            obj.position.y = obj.userData.originalPosition.y + Math.sin(time * obj.userData.floatSpeed + obj.userData.floatOffset) * 0.5;
        }
    });
    
    dataRenderer.render(dataScene, dataCamera);
}

// Background 3D animations for different sections
function initSection3D(containerId, type) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, container.offsetWidth / container.offsetHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    
    renderer.setSize(container.offsetWidth, container.offsetHeight);
    renderer.setClearColor(0x000000, 0);
    container.appendChild(renderer.domElement);

    // MODIFIED: Added variables needed for the 'about' animation
    let objects = [], particleData = [], lineMesh;

    switch(type) {
        // MODIFIED: New case for 'about' section animation
        case 'about':
            const pCount = 50; const particlesGeo = new THREE.BufferGeometry(); const positions = new Float32Array(pCount*3);
            for(let i=0; i<pCount; i++){ positions[i*3]=(Math.random()-0.5)*20; positions[i*3+1]=(Math.random()-0.5)*20; positions[i*3+2]=(Math.random()-0.5)*20 - 5; particleData.push({velocity:new THREE.Vector3(-1+Math.random()*2,-1+Math.random()*2,0).multiplyScalar(0.01)}); }
            particlesGeo.setAttribute('position', new THREE.BufferAttribute(positions,3).setUsage(THREE.DynamicDrawUsage));
            objects.push(new THREE.Points(particlesGeo, new THREE.PointsMaterial({color:0x88aaff,size:0.2,transparent:true,opacity:0.8})));
            const lineGeo = new THREE.BufferGeometry(); lineGeo.setAttribute('position',new THREE.BufferAttribute(new Float32Array(pCount*pCount*6),3).setUsage(THREE.DynamicDrawUsage));
            lineMesh = new THREE.LineSegments(lineGeo, new THREE.LineBasicMaterial({color:0xffffff,transparent:true,opacity:0.2}));
            objects.push(lineMesh); scene.add(objects[0]); scene.add(lineMesh);
            break;
        
        case 'skills':
            // Floating skill icons
            for (let i = 0; i < 15; i++) {
                const geometry = new THREE.OctahedronGeometry(0.5, 0);
                const material = new THREE.MeshPhongMaterial({
                    color: new THREE.Color().setHSL(i / 15, 0.7, 0.6),
                    transparent: true,
                    opacity: 0.3,
                    wireframe: true
                });
                const mesh = new THREE.Mesh(geometry, material);
                mesh.position.set(
                    (Math.random() - 0.5) * 20,
                    (Math.random() - 0.5) * 10,
                    (Math.random() - 0.5) * 10
                );
                objects.push(mesh);
                scene.add(mesh);
            }
            break;
            
        case 'education':
            // Floating books/papers
            for (let i = 0; i < 10; i++) {
                const geometry = new THREE.BoxGeometry(1, 1.5, 0.1);
                const material = new THREE.MeshPhongMaterial({
                    color: new THREE.Color().setHSL(0.1, 0.3, 0.7),
                    transparent: true,
                    opacity: 0.2
                });
                const book = new THREE.Mesh(geometry, material);
                book.position.set(
                    (Math.random() - 0.5) * 15,
                    (Math.random() - 0.5) * 8,
                    (Math.random() - 0.5) * 5
                );
                book.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
                objects.push(book);
                scene.add(book);
            }
            break;
            
        case 'projects':
            // Rotating cubes representing projects
            for (let i = 0; i < 8; i++) {
                const geometry = new THREE.BoxGeometry(0.8, 0.8, 0.8);
                const material = new THREE.MeshPhongMaterial({
                    color: new THREE.Color().setHSL(i / 8, 0.8, 0.5),
                    transparent: true,
                    opacity: 0.3,
                    wireframe: true
                });
                const cube = new THREE.Mesh(geometry, material);
                cube.position.set(
                    (Math.random() - 0.5) * 20,
                    (Math.random() - 0.5) * 10,
                    (Math.random() - 0.5) * 10
                );
                objects.push(cube);
                scene.add(cube);
            }
            break;
            
        case 'internship':
            // Connected nodes representing experience
            for (let i = 0; i < 12; i++) {
                const geometry = new THREE.IcosahedronGeometry(0.3, 0);
                const material = new THREE.MeshPhongMaterial({
                    color: new THREE.Color().setHSL(0.3, 0.7, 0.6),
                    transparent: true,
                    opacity: 0.3
                });
                const node = new THREE.Mesh(geometry, material);
                node.position.set(
                    (Math.random() - 0.5) * 10,
                    (Math.random() - 0.5) * 6,
                    (Math.random() - 0.5) * 5
                );
                objects.push(node);
                scene.add(node);
            }
            break;
            
        case 'certifications':
            // Floating badges
            for (let i = 0; i < 6; i++) {
                const geometry = new THREE.TorusGeometry(0.5, 0.2, 8, 20);
                const material = new THREE.MeshPhongMaterial({
                    color: new THREE.Color().setHSL(0.15, 0.8, 0.6),
                    transparent: true,
                    opacity: 0.4
                });
                const torus = new THREE.Mesh(geometry, material);
                torus.position.set(
                    (Math.random() - 0.5) * 15,
                    (Math.random() - 0.5) * 8,
                    (Math.random() - 0.5) * 5
                );
                objects.push(torus);
                scene.add(torus);
            }
            break;
            
        case 'contact':
            // Communication waves
            for (let i = 0; i < 20; i++) {
                const geometry = new THREE.RingGeometry(0.5, 1, 8);
                const material = new THREE.MeshPhongMaterial({
                    color: new THREE.Color().setHSL(0.9, 0.7, 0.7),
                    transparent: true,
                    opacity: 0.2,
                    side: THREE.DoubleSide
                });
                const ring = new THREE.Mesh(geometry, material);
                ring.position.set(
                    (Math.random() - 0.5) * 20,
                    (Math.random() - 0.5) * 10,
                    (Math.random() - 0.5) * 10
                );
                objects.push(ring);
                scene.add(ring);
            }
            break;
            
        case 'game':
            // Floating elements
            for (let i = 0; i < 20; i++) {
                const shapes = [
                    new THREE.SphereGeometry(0.3, 8, 8),
                    new THREE.OctahedronGeometry(0.3, 0),
                    new THREE.TorusGeometry(0.2, 0.1, 8, 16)
                ];
                const geometry = shapes[Math.floor(Math.random() * shapes.length)];
                const material = new THREE.MeshPhongMaterial({
                    color: new THREE.Color().setHSL(0.5 + Math.random() * 0.1, 0.8, 0.7),
                    transparent: true,
                    opacity: 0.4,
                    emissive: new THREE.Color().setHSL(0.5 + Math.random() * 0.1, 0.8, 0.3),
                    emissiveIntensity: 0.2
                });
                const shape = new THREE.Mesh(geometry, material);
                shape.position.set(
                    (Math.random() - 0.5) * 25,
                    (Math.random() - 0.5) * 15,
                    (Math.random() - 0.5) * 10
                );
                shape.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
                objects.push(shape);
                scene.add(shape);
            }
            break;
    }

    camera.position.z = 10;

    function animate() {
        requestAnimationFrame(animate);
        
        // MODIFIED: Added special animation logic for the 'about' section
        if (type === 'about') {
            let positions=objects[0].geometry.attributes.position, line_count=0, linePos=lineMesh.geometry.attributes.position;
            for(let i=0;i<particleData.length;i++){
                positions.array[i*3]+=particleData[i].velocity.x;
                positions.array[i*3+1]+=particleData[i].velocity.y;
                if(positions.array[i*3+1]<-10||positions.array[i*3+1]>10)particleData[i].velocity.y*=-1;
                if(positions.array[i*3]<-10||positions.array[i*3]>10)particleData[i].velocity.x*=-1;
            } 
            for(let i=0;i<particleData.length;i++)for(let j=i+1;j<particleData.length;j++){
                const dx=positions.array[i*3]-positions.array[j*3],dy=positions.array[i*3+1]-positions.array[j*3+1],dz=positions.array[i*3+2]-positions.array[j*3+2];
                if(Math.sqrt(dx*dx+dy*dy+dz*dz)<3.5){
                    const start=line_count*6;
                    linePos.array[start]=positions.array[i*3];
                    linePos.array[start+1]=positions.array[i*3+1];
                    linePos.array[start+2]=positions.array[i*3+2];
                    linePos.array[start+3]=positions.array[j*3];
                    linePos.array[start+4]=positions.array[j*3+1];
                    linePos.array[start+5]=positions.array[j*3+2];
                    line_count++;
                }
            } 
            lineMesh.geometry.setDrawRange(0,line_count*2); 
            positions.needsUpdate=linePos.needsUpdate=true;
        } else {
            // This is the logic for all other sections
            objects.forEach((obj, index) => {
                if (type === 'skills') {
                    obj.rotation.x += 0.01; obj.rotation.y += 0.01; obj.position.y += Math.sin(Date.now() * 0.001 + index) * 0.01;
                } else if (type === 'education') {
                    obj.rotation.x += 0.005; obj.rotation.y += 0.005; obj.position.y += Math.sin(Date.now() * 0.0005 + index) * 0.02;
                } else if (type === 'projects') {
                    obj.rotation.x += 0.02; obj.rotation.y += 0.02; obj.position.x += Math.sin(Date.now() * 0.001 + index) * 0.02;
                } else if (type === 'internship') {
                    obj.rotation.x += 0.01; obj.rotation.y += 0.01; obj.scale.setScalar(1 + Math.sin(Date.now() * 0.002 + index) * 0.1);
                } else if (type === 'certifications') {
                    obj.rotation.x += 0.015; obj.rotation.y += 0.015; obj.rotation.z += 0.01;
                } else if (type === 'contact') {
                    obj.rotation.z += 0.02; obj.scale.setScalar(1 + Math.sin(Date.now() * 0.003 + index) * 0.2);
                } else if (type === 'game') {
                    obj.rotation.x += 0.01; obj.rotation.y += 0.01; obj.position.y += Math.sin(Date.now() * 0.002 + index) * 0.03; obj.scale.setScalar(1 + Math.sin(Date.now() * 0.003 + index) * 0.1);
                }
            });
        }
        renderer.render(scene, camera);
    }

    animate();

    // Handle resize
    window.addEventListener('resize', () => {
        camera.aspect = container.offsetWidth / container.offsetHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(container.offsetWidth, container.offsetHeight);
    });
}

// Handle window resize for main scenes
window.addEventListener('resize', () => {
    if (heroCamera && heroRenderer) {
        heroCamera.aspect = window.innerWidth / window.innerHeight;
        heroCamera.updateProjectionMatrix();
        heroRenderer.setSize(window.innerWidth, window.innerHeight);
    }
    
    if (dataCamera && dataRenderer) {
        const container = document.getElementById('data-viz-container');
        dataCamera.aspect = container.offsetWidth / container.offsetHeight;
        dataCamera.updateProjectionMatrix();
        dataRenderer.setSize(container.offsetWidth, container.offsetHeight);
    }
});

// Initialize all 3D scenes when page loads
window.addEventListener('load', () => {
    initHeroBackground();
    initDataVisualization();
    
    // Initialize section 3D backgrounds
    setTimeout(() => {
        initSection3D('skills-3d-container', 'skills');
        initSection3D('about-3d-container', 'about');
        initSection3D('education-3d-container', 'education');
        initSection3D('projects-3d-container', 'projects');
        initSection3D('internship-3d-container', 'internship');
        initSection3D('certifications-3d-container', 'certifications');
        initSection3D('contact-3d-container', 'contact');
        initSection3D('game-3d-container', 'game');
    }, 100);
    
    // Initialize game
    setTimeout(() => {
        initGame();
    }, 500);
    
    // Hide loading screen
    setTimeout(() => {
        document.getElementById('loadingScreen').classList.add('hidden');
    }, 1500);
});

// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        document.querySelector(this.getAttribute('href')).scrollIntoView({
            behavior: 'smooth'
        });
    });
});

// Timeline animation on scroll
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
};

const observer = new IntersectionObserver(function(entries) {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('show');
        }
    });
}, observerOptions);

document.querySelectorAll('.timeline-item').forEach(item => {
    observer.observe(item);
});

// Navbar background on scroll
window.addEventListener('scroll', function() {
    const navbar = document.getElementById('navbar');
    if (window.scrollY > 50) {
        navbar.style.background = 'rgba(255, 255, 255, 0.98)';
        navbar.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.1)';
    } else {
        navbar.style.background = 'rgba(255, 255, 255, 0.95)';
        navbar.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.1)';
    }

    // Show/hide scroll to top button
    const scrollTop = document.getElementById('scrollTop');
    if (window.scrollY > 300) {
        scrollTop.classList.add('active');
    } else {
        scrollTop.classList.remove('active');
    }
});

// Scroll to top functionality
document.getElementById('scrollTop').addEventListener('click', function() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
});

// Download CV function
function downloadCV() {
    const cvContent = `
        ANUSHA S
        MSc Data Science Student
        
        CONTACT INFORMATION
        Email: anushameleppura@gmail.com
        Phone: +91 9847490668
        Location: Palakkad, Kerala
        
        EDUCATION
        MSc Data Science (2024-2026)
        Bharathiar University
        Nehru Arts And Science College
        
        BSc Mathematics (2021-2024)
        Calicut University
        Yuvakshetra Institute Of Management Studies, Ezhakkad
        
        12th Grade (2019-2021)
        State Board of Kerala
        C.A Higher Secondary School
        
        10th Grade (2019)
        State Board of Kerala
        C.A High School
        
        TECHNICAL SKILLS
        • Python, SQL
        • Machine Learning
        • Power BI, Tableau
        • Exploratory Data Analysis
        • MS Word, MS PowerPoint
        
        PROJECTS
        • Email Spam Detection using Machine Learning
        
        INTERNSHIP
        • Machine Learning With Data Science (1 Month)
        
        CERTIFICATIONS
        • Data Analytics – ICT ACADEMY (2023)
        • Latex – Yuvakshetra Institute (2023)
        • IoT – NPTEL (2025)
    `;
    
    const blob = new Blob([cvContent], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Anusha_S_CV.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
}

// Add interactive animations
document.addEventListener('DOMContentLoaded', function() {
    // Animate skill cards on hover
    const skillCards = document.querySelectorAll('.skill-card');
    skillCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-10px) scale(1.05) rotateX(5deg)';
        });
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1) rotateX(0)';
        });
    });

    // Add typing effect to hero title
    const heroTitle = document.querySelector('.hero-content h1');
    const text = heroTitle.textContent;
    heroTitle.textContent = '';
    let i = 0;
    
    function typeWriter() {
        if (i < text.length) {
            heroTitle.textContent += text.charAt(i);
            i++;
            setTimeout(typeWriter, 50);
        }
    }
    
    setTimeout(typeWriter, 1500);
});