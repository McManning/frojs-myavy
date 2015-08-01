
requirejs.config({
    paths: {
        'fro': '../../frojs/dist/fro',
        'myavy': '../src/frojs.myavy'
    }
});

require([
    'fro',
    'myavy'
], function(fro, MyAvy) {
    
    var context = new fro.World({
        plugins: {
            // This is the part that matters: Configuration for the MyAvy plugin.
            MyAvy: {
                enablePicker: true,
                pickerOptions: ['a', 'b', 'c']
            }
            // Everything below this line is just boilerplate setup crap. :)
        },
        renderer: {
            canvas: document.getElementById('fro-canvas'),
            background: [145, 184, 101]
        },
        world: {
            entities: []
        },
        player: {
            type: 'Actor',
            id: 'player',
            position: [0, 0, 0],
            name: 'Local Player',
            direction: 2, // south
            action: 0, // idle
            avatar: {
                type: 'Animation',
                url: "http://i.imgur.com/MAT9aD2.png", // Original frojs default avatar
                autoplay: true,
                width: 32,
                height: 32,
                keyframes: {
                    move_2: {
                        loop: true,
                        frames: [0, 1000, 1, 1000]
                    },
                }
            }
        }
    });

});
