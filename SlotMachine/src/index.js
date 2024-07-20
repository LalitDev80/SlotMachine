
const app = new PIXI.Application();
await app.init({ background: '#1099bb', resizeTo: window });
document.body.appendChild(app.canvas);

await PIXI.Assets.load([
    'assest/hv1_symbol.png',
    'assest/hv2_symbol.png',
    'assest/hv3_symbol.png',
    'assest/hv4_symbol.png',
    'assest/lv1_symbol.png',
    'assest/lv2_symbol.png',
    'assest/lv3_symbol.png',
    'assest/lv4_symbol.png',
    'assest/background.jpg'
]);

const REEL_WIDTH = 160;
const SYMBOL_SIZE = 150;

// Create different slot symbols
const backgroundTexture = PIXI.Texture.from('assest/background.jpg');

const slotTextures = [
    PIXI.Texture.from('assest/hv1_symbol.png'),
    PIXI.Texture.from('assest/hv2_symbol.png'),
    PIXI.Texture.from('assest/hv3_symbol.png'),
    PIXI.Texture.from('assest/hv4_symbol.png'),
    PIXI.Texture.from('assest/lv1_symbol.png'),
    PIXI.Texture.from('assest/lv2_symbol.png'),
    PIXI.Texture.from('assest/lv3_symbol.png'),
    PIXI.Texture.from('assest/lv4_symbol.png')   
];

const reels = [];
const reelContainer = new PIXI.Container();
const backgroundSprite = new PIXI.Sprite(backgroundTexture); 

// Create Reel Panel
const center = new PIXI.Graphics().rect(0,0,REEL_WIDTH * 5,SYMBOL_SIZE * 3);
center.fill({ color: 0xFF3300, alpha: 0.8 });
reelContainer.addChild(center);

let numberOfReels =5;
let slotHeight = 4;
// Set The Symbol Position firstTime
for (let i = 0; i < numberOfReels; i++) {
    const rc = new PIXI.Container();

    rc.x = i * REEL_WIDTH;
    reelContainer.addChild(rc);

    const reel = {
        symbols: [],
        position: 0,
    };

    // Build the symbols
    for (let j = 0; j < slotHeight; j++) {
        const symbol = new PIXI.Sprite(slotTextures[Math.floor(Math.random() * slotTextures.length)]);

        symbol.y = j * SYMBOL_SIZE;
        symbol.scale.x = symbol.scale.y = Math.min(SYMBOL_SIZE / symbol.width, SYMBOL_SIZE / symbol.height);
        symbol.x = Math.round((SYMBOL_SIZE - symbol.width) / 2);
        reel.symbols.push(symbol);
        rc.addChild(symbol);
    }
    reels.push(reel);
}
app.stage.addChild(backgroundSprite);
app.stage.addChild(reelContainer);

const margin = (app.screen.height - SYMBOL_SIZE * 3) / 2;

reelContainer.y = margin;
reelContainer.x = (app.screen.width - REEL_WIDTH * 5) / 2;

// Top Margin
const top = new PIXI.Graphics().rect(0, 0, app.screen.width, margin).fill({ color: 0x0 });

// Bottom Margin
const bottom = new PIXI.Graphics().rect(0, SYMBOL_SIZE * 3 + margin, app.screen.width, margin).fill({ color: 0x0 });

// Spin Button Area
const circle = new PIXI.Graphics();
circle.drawCircle(app.screen.width / 2, SYMBOL_SIZE * 3 + margin + bottom.height / 2, margin /2);
circle.fill({ color: 0xc34288, alpha: 1 });



const style = new PIXI.TextStyle({
    fontFamily: 'Arial',
    fontSize: 50,
    fontStyle: 'italic',
    fontWeight: 'bold',
    fill: { color: 0x00FF00 },
    stroke: { color: 0x4a1850, width: 5 },
    wordWrap: true,
    wordWrapWidth: 440,
});

const playText = new PIXI.Text('Spin', style);

playText.x = Math.round((bottom.width - playText.width) / 2);
playText.y = app.screen.height - margin + Math.round((margin - playText.height) / 2);
circle.addChild(playText);

// Add header text
const headerText = new PIXI.Text('5X3 SlotMachine!', style);

headerText.x = Math.round((top.width - headerText.width) / 2);
headerText.y = Math.round((margin - headerText.height) / 2);
top.addChild(headerText);

app.stage.addChild(top);
app.stage.addChild(bottom);
app.stage.addChild(circle);

// Set the interactivity.
circle.eventMode = 'static';
circle.cursor = 'pointer';
circle.addListener('pointerdown', () => {
    startPlay();
});

let running = false;

// Function to start playing.
function startPlay() {
    if (running) return;
    running = true;

    for (let i = 0; i < reels.length; i++) {
        const r = reels[i];
        const extra =  3;
        const target = r.position + 10 + i * 5 + extra;
        const time = 1000 + i * 600 + extra * 600;

        tweenTo(r, 'position', target, time, backout(0.5), null, i === reels.length - 1 ? reelsComplete : null);
    }
}

// Reels done handler.
function reelsComplete() {
    running = false;   
}


app.ticker.add(() => {

    if(running)
    {
        for (let i = 0; i < reels.length; i++) {
            const r = reels[i];
            for (let j = 0; j < r.symbols.length; j++) {
                const s = r.symbols[j];
                const prevy = s.y;
    
                s.y = ((r.position + j) % r.symbols.length) * SYMBOL_SIZE - SYMBOL_SIZE;
                if (s.y < 0 && prevy > SYMBOL_SIZE) {
                    s.texture = slotTextures[Math.floor(Math.random() * slotTextures.length)];
                    s.scale.x = s.scale.y = Math.min(SYMBOL_SIZE / s.texture.width, SYMBOL_SIZE / s.texture.height);
                    s.x = Math.round((SYMBOL_SIZE - s.width) / 2);
                }
            }
        }
    }
    
});


const tweening = [];


function tweenTo(object, property, target, time, easing, onchange, oncomplete) {
    const tween = {
        object,
        property,
        propertyBeginValue: object[property],
        target,
        easing,
        time,
        change: onchange,
        complete: oncomplete,
        start: Date.now(),
    };

    tweening.push(tween);

    return tween;
}
// Listen for animate update.
app.ticker.add(() => {

    if(running)
    {
        const now = Date.now();
        const remove = [];
    
        for (let i = 0; i < tweening.length; i++) {
            const t = tweening[i];
            const phase = Math.min(1, (now - t.start) / t.time);
    
            t.object[t.property] = lerp(t.propertyBeginValue, t.target, t.easing(phase));
            if (phase === 1) {
                t.object[t.property] = t.target;
                if (t.complete) t.complete(t);
                remove.push(t);
            }
        }
        for (let i = 0; i < remove.length; i++) {
            tweening.splice(tweening.indexOf(remove[i]), 1);
        }
    }
});


function lerp(a1, a2, t) {
    return a1 * (1 - t) + a2 * t;
}

function backout(amount) {
    return (t) => --t * t * ((amount + 1) * t + amount) + 1;
}