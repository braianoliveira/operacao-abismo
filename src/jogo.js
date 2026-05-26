const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    backgroundColor: '#000000',
    physics: {
        default: 'arcade',
        arcade: { gravity: { y: 0 }, debug: false }
    },
    scene: { preload: preload, create: create, update: update }
};

const game = new Phaser.Game(config);

let jogoComecou = false;

let submarino;
let cursors;
let minas;
let pecas;
let carga;
let gameOver;
let faseDois;

let velocidade = 150;
let grupoSonar;
let velocidadeSonar = 300;
let alcanceSonar = 250;
let bateria = 100;

let faseAtual = 1;
let totalPecasNecessarias = 5;
let vidas = 3;
let pecasEncontradas = 0;

let textoBateria;
let textoPartesEncontradas;
let textoVidasRestantes;
let pecasText;
let isVulneravel = false;
let isGameOver = false;

let posicoesOcupadas = [];

function preload() {
    this.load.audio('sonar', 'assets/sonar.wav');
    this.load.audio('ambientacao', 'assets/ambientacao.mp3');
    this.load.audio('coleta', 'assets/coleta.wav');
    this.load.audio('explosao', 'assets/explosao.wav');
    this.load.audio('bateria', 'assets/bateria.wav');

    this.load.image('imgSubmarino', 'assets/submarino.png');
    this.load.image('imgMina', 'assets/mina.png');
    this.load.image('imgPeca', 'assets/peca.png');
    this.load.image('imgBateria', 'assets/bateria.png');
}

function create() {
    faseAtual = 1;
    this.cameras.main.setBackgroundColor('#050505');

    bateria = 100;
    pecasEncontradas = 0;
    vidas = 3;
    isGameOver = false;
    isVulneravel = false;
    posicoesOcupadas = [];
    jogoComecou = false;

    let menuOverlay = this.add.rectangle(400, 300, 800, 600, 0x000000).setDepth(100);

    let titulo = this.add.text(400, 150, "OPERAÇÃO: ABISMO", { 
        font: "40px 'Courier New'", fill: "#4ade80", style: "bold"
    }).setOrigin(0.5).setDepth(101);

    let textoIntro = "\n\nA expedição falhou. O leme travou e a navegação \nestá permanentemente avariada.\n\n" +
                    "Objetivo: a superfície. Mas primeiro, recolha as peças do casco nas\n" +
                    "sombras. ATENÇÃO: itens só podem ser coletados enquanto visíveis pelo\n" +
                    "sonar. Eles somem rápido, então seja ágil em suas manobras limitadas.\n\n" +
                    "ESTRATÉGIA: O sonar drena bateria. Há apenas UMA célula de energia\n" +
                    "oculta; não a desperdice cedo. ALERTA FATAL: emitir um pulso de sonar\n" +
                    "estando diretamente sobre uma mina causará detonação imediata.\n\n" +
                    "[ MOUSE ]: Disparar Sonar   |   [ SETAS ]: Tentar manobrar";

    let instrucoes = this.add.text(400, 300, textoIntro, { 
        font: "18px 'Courier New'", fill: "#aaaaaa", align: "center", lineSpacing: 8
    }).setOrigin(0.5).setDepth(101);

    let startHint = this.add.text(400, 480, "[ PRESSIONE ESPAÇO PARA INICIAR OS SISTEMAS ]", { 
        font: "20px 'Courier New'", fill: "#ffffff" 
    }).setOrigin(0.5).setDepth(101);

    this.tweens.add({ targets: startHint, alpha: 0.2, duration: 800, yoyo: true, repeat: -1 });

    this.input.keyboard.once('keydown-SPACE', () => {
        menuOverlay.destroy();
        titulo.destroy();
        instrucoes.destroy();
        startHint.destroy();
        jogoComecou = true;

        let ambientacao = this.sound.add('ambientacao', { volume: 0.3, loop: true });
        ambientacao.play();
    });

    let ambientacao = this.sound.add('ambientacao', { volume: 0.3, loop: true });
    ambientacao.play();

    submarino = this.physics.add.sprite(400, 300, 'imgSubmarino');
    submarino.setScale(0.15); 

    let larguraHitBox = submarino.width * 0.6;
    let alturaHitBox = submarino.height * 0.6;
    submarino.body.setSize(larguraHitBox, alturaHitBox);
    submarino.body.setOffset((submarino.width - larguraHitBox) / 2, (submarino.height - alturaHitBox) / 2);

    grupoSonar = this.physics.add.group();
    posicoesOcupadas = [];

    let hudBackground = this.add.rectangle(400, 20, 800, 40, 0x000814);
    hudBackground.setAlpha(0.85);
    hudBackground.setDepth(10);
    hudBackground.setStrokeStyle(1, 0x333333);

    const estiloTexto = { 
        font: "14px 'Courier New'",
        fill: "#4ade80",
        align: "center"
    };

    textoBateria = this.add.text(20, 12, "BATERIA: 100%", estiloTexto).setDepth(11);
    textoVidasRestantes = this.add.text(330, 12, "INTEGRIDADE: 3", estiloTexto).setDepth(11);
    pecasText = this.add.text(540, 12, "Partes encontradas: 0 de " + totalPecasNecessarias, estiloTexto).setDepth(11);

    this.physics.add.existing(submarino);
    submarino.body.setCollideWorldBounds(true);

    cursors = this.input.keyboard.createCursorKeys();

    this.input.on('pointerdown', ativarSonar, this);

    pecas = this.physics.add.group();
    for (let i = 0; i < totalPecasNecessarias; i++) {
        let pos = getSafePosition();
        let peca = pecas.create(pos.x, pos.y, 'imgPeca');
        peca.setScale(0.1);
        let rRadius = 100; 
        peca.body.setCircle(rRadius, (peca.width / 2) - rRadius, (peca.height / 2) - rRadius);
        peca.setAlpha(0);
        pecas.add(peca);
    }

    minas = this.physics.add.group();
    for (let i = 0; i < 8; i++) {
        let pos = getSafePosition();
        let mina = minas.create(pos.x, pos.y, 'imgMina');
        mina.setScale(0.12);
        let rRadius = 100; 
        mina.body.setCircle(rRadius, (mina.width / 2) - rRadius, (mina.height / 2) - rRadius);
        mina.setAlpha(0);
        minas.add(mina);
    }

    let cargas = this.physics.add.group();
    let posCarga = getSafePosition();
    let carga = cargas.create(posCarga.x, posCarga.y, 'imgBateria');
    carga.setScale(0.1);

    let rRadius = 100; 
    carga.body.setCircle(rRadius, (carga.width / 2) - rRadius, (carga.height / 2) - rRadius);
    carga.setAlpha(0);

    this.physics.add.overlap(grupoSonar, pecas, revelarPecas, null, this);
    this.physics.add.overlap(submarino, pecas, coletarPeca, null, this);
    this.physics.add.overlap(grupoSonar, minas, revelarMina, null, this);
    this.physics.add.overlap(submarino, minas, impactoMina, null, this);
    this.physics.add.overlap(grupoSonar, cargas, revelarCarga, null, this);
    this.physics.add.overlap(submarino, cargas, coletarCarga, null, this);
}

function update() {
    if (!jogoComecou || isGameOver) return;

    submarino.body.setVelocity(0);

    if (cursors.left.isDown) 
        submarino.body.setVelocityX(-velocidade);
    else if (cursors.right.isDown) 
        submarino.body.setVelocityX(velocidade);

    if (cursors.up.isDown) 
        submarino.body.setVelocityY(-velocidade);
    else if (cursors.down.isDown) 
        submarino.body.setVelocityY(velocidade);

    let ponteiro = this.input.activePointer;
    let angulo = Phaser.Math.Angle.Between(submarino.x, submarino.y, ponteiro.x, ponteiro.y);

    submarino.setRotation(angulo);

    if (faseAtual === 2 && !isGameOver) {

        let percent = Phaser.Math.Percent(submarino.y, 600, 50);

        let blueVal = Math.floor(Phaser.Math.Linear(10, 140, percent));

        this.cameras.main.setBackgroundColor(`rgb(0, 10, ${blueVal})`);

        if (submarino.y <= 50) {
            jogoComecou = false;
            submarino.body.setVelocity(0);

            this.add.rectangle(400, 300, 800, 600, 0x000000, 0.7).setDepth(99);

            this.add.text(400, 250, "SUPERFÍCIE ALCANÇADA\nMISSÃO CONCLUÍDA", { 
                font: "30px 'Courier New'", fill: "#4ade80", align: "center", style: "bold" 
            }).setOrigin(0.5).setDepth(100);

            this.add.text(400, 380, "PRESSIONE 'R' PARA JOGAR NOVAMENTE", { 
                font: "18px 'Courier New'", fill: "#ffffff" 
            }).setOrigin(0.5).setDepth(100);

            this.input.keyboard.once('keydown-R', () => {
                this.sound.stopAll();
                this.scene.restart();
            });
        }
    }
}

function ativarSonar(pointer) {
    if (!jogoComecou || isGameOver) return;

    if (faseAtual !== 1) return;

    if (bateria >= 5 ) {
        this.sound.play('sonar', { volume: 0.5 });

        bateria -= 5;
        textoBateria.setText("BATERIA: " + bateria + "%");

        let angle = Phaser.Math.Angle.Between(submarino.x, submarino.y, pointer.x, pointer.y);
        criaOndaSonar.call(this, submarino.x, submarino.y, angle);
    } else {
        textoBateria.setFill("#ff0000");
        checkGameOver.call(this);
    }
}

function criaOndaSonar(x, y, angle) {
    let ondaSonar = this.add.circle(x, y, 10, 0xffffff, 0.3);
    ondaSonar.setStrokeStyle(2, 0xffffff, 0.8);

    this.physics.add.existing(ondaSonar);

    let vx = Math.cos(angle) * velocidadeSonar;
    let vy = Math.sin(angle) * velocidadeSonar;

    ondaSonar.body.setVelocity(vx, vy);

    this.tweens.add({
        targets: ondaSonar,
        scale: 6,
        alpha: 0,
        duration: 1200,
        onComplete: () => { 
            ondaSonar.destroy(); 
        }
    });

    grupoSonar.add(ondaSonar);
}

function getSafePosition() {
    let x, y;
    let safe = false;
    let safeDistance = 60;
    let spawnSafeDistance = 150;

    while (!safe) {
        safe = true;
        x = Phaser.Math.Between(50, 750);
        y = Phaser.Math.Between(50, 550);

        if (Phaser.Math.Distance.Between(x, y, 400, 300) < spawnSafeDistance) {
            safe = false;
            continue;
        }

        for (let i = 0; i < posicoesOcupadas.length; i++) {
            let pos = posicoesOcupadas[i];
            if (Phaser.Math.Distance.Between(x, y, pos.x, pos.y) < safeDistance) {
                safe = false;
                break;
            }
        }
    }

    posicoesOcupadas.push({ x: x, y: y });
    return { x: x, y: y };
}

function revelarPecas(sonar, peca) {
    this.tweens.add({
        targets: peca,
        alpha: 1,
        duration: 500,
        hold: 500,
        onComplete: () => { 
            if (peca.active) peca.setAlpha(0); 
        }
    });
}

function coletarPeca(submarino, peca) {
    if (peca.alpha > 0.5) {
        this.sound.play('coleta', { volume: 0.5 });

        peca.destroy();
        pecasEncontradas++;

        pecasText.setText("Partes encontradas: " + pecasEncontradas + " de " + totalPecasNecessarias);

        if (pecasEncontradas >= totalPecasNecessarias) {
            if (faseAtual === 1) {
                transicaoFaseDois.call(this);
            }
        }
    }
}

function checkGameOver() {
    if (pecasEncontradas < totalPecasNecessarias && bateria < 5) {
        isGameOver = true;
        submarino.body.setVelocity(0);

        this.add.text(400, 300, "SISTEMAS INOPERANTES VOCÊ FICOU PRESO NO ABISSO", { 
            font: "24px 'Courier New'", fill: "#ff0000", align: "center" 
        }).setOrigin(0.5).setDepth(16);

        this.add.text(400, 400, "PRESSIONE 'R' PARA RECOMEÇAR", { 
            font: "18px 'Courier New'", fill: "#ffffff", align: "center" 
        }).setOrigin(0.5).setDepth(20);

        this.input.keyboard.once('keydown-R', () => {
            this.sound.stopAll();
            this.scene.restart();
        });
    }
}

function revelarMina(sonar, mina) {
    this.tweens.add({
        targets: mina,
        alpha: 1,
        duration: 200,
        hold: 1000,
        onComplete: () => { 
            mina.setAlpha(0); 
        }
    });
}

function impactoMina(submarino, mina) {
    if (mina.alpha > 0.5 && !isVulneravel) {
        this.sound.play('explosao', { volume: 0.5 });

        mina.destroy();
        vidas--;
        textoVidasRestantes.setText("INTEGRIDADE: " + vidas);

        this.cameras.main.flash(500, 255, 0, 0);
        this.cameras.main.shake(200, 0.01);

        if (vidas <= 0) {
            isGameOver = true;
            submarino.body.setVelocity(0);
            this.add.text(400, 300, "SISTEMAS CRÍTICOS: EXPLOSÃO DETECTADA\nFIM DA MISSÃO", { 
                font: "24px 'Courier New'", fill: "#ff0000", align: "center" 
            }).setOrigin(0.5).setDepth(16);

            this.add.text(400, 400, "PRESSIONE 'R' PARA RECOMEÇAR", { 
                font: "18px 'Courier New'", fill: "#ffffff" 
            }).setOrigin(0.5).setDepth(20);

            this.input.keyboard.once('keydown-R', () => {
                this.sound.stopAll();
                this.scene.restart();
            });
        } else {
            isVulneravel = true;
            submarino.setAlpha(0.5);
            this.time.delayedCall(1500, () => {
                isVulneravel = false;
                submarino.setAlpha(1);
            }, [], this);
        }
    }
}

function revelarCarga(sonar, carga) {
    if (carga.alpha > 0) 
        return;

    this.tweens.add({
        targets: carga,
        alpha: 1,
        duration: 200,
        hold: 2000,
        onComplete: () => { 
            if (carga.active) 
                carga.setAlpha(0); 
        }
    });
}

function coletarCarga(submarino, carga) {
    if (carga.alpha > 0.5) {
        this.sound.play('bateria', { volume: 0.5 });

        carga.destroy(); 

        bateria = Math.min(100, bateria + 50);

        textoBateria.setText("BATERIA: " + bateria + "%");
        textoBateria.setFill("#4ade80");

        this.cameras.main.flash(300, 0, 255, 255);
    }
}

function transicaoFaseDois() {
    jogoComecou = false; 
    submarino.body.setVelocity(0); 

    let overlay = this.add.rectangle(400, 300, 800, 600, 0x000000).setDepth(100);

    let titulo = this.add.text(400, 180, "SISTEMAS REPARADOS\n", { 
        font: "32px 'Courier New'", fill: "#4ade80", style: "bold" 
    }).setOrigin(0.5).setDepth(101);

    let mensagem = this.add.text(400, 300, 
        "Casco selado. Motores reativados.\n\n" +
        "A verdadeira provação começa agora: a ascensão rumo à superfície.\n" +
        "O radar revela um campo minado letal bloqueando sua rota de fuga.\n" +
        "As minas são menores e hipersensíveis; a mera vibração da água\n" +
        "ao redor delas desencadeará uma explosão.\n\n" +
        "A integridade estrutural herdada do abismo continua crítica.\n" +
        "Um erro agora custará tudo. Suba com cautela.", 
        { font: "18px 'Courier New'", fill: "#cccccc", align: "center", lineSpacing: 8 }
    ).setOrigin(0.5).setDepth(101);

    let hint = this.add.text(400, 480, "[ PRESSIONE ESPAÇO PARA EMERGIR ]", { 
        font: "20px 'Courier New'", fill: "#ffffff" 
    }).setOrigin(0.5).setDepth(101);

    this.tweens.add({ targets: hint, alpha: 0.3, duration: 800, yoyo: true, repeat: -1 });

    this.input.keyboard.once('keydown-SPACE', () => {
        overlay.destroy();
        titulo.destroy();
        mensagem.destroy();
        hint.destroy();

        IniciarFaseDois.call(this);
    });
}

function IniciarFaseDois() {
    faseAtual = 2;
    jogoComecou = true;

    submarino.setPosition(400, 560); 
    submarino.body.setVelocity(0);

    if (minas) 
        minas.clear(true, true); 

    faseDois = this.physics.add.group();

    for (let i = 0; i < 50; i++) {
        let x = Phaser.Math.Between(30, 770);
        let y = Phaser.Math.Between(80, 480);

        let mina = faseDois.create(x, y, 'imgMina');

        mina.setScale(0.1); 

        mina.setTint(0xff4444); 

        mina.setAlpha(1);

        let radius = 100;
        mina.body.setCircle(radius, (mina.width / 2) - radius, (mina.height / 2) - radius);
        
        mina.body.setImmovable(true);
    }

    this.physics.add.overlap(submarino, faseDois, impactoMina, null, this);
}