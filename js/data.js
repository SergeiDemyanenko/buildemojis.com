
let data = {
    smile: {
        title: 'Smile',
        model: [
            {character: ':', canvas: {height: 1, width: 1, right: 0, down: 0}},
            {character: ')',canvas: {height: 1, width: 1, right: 0, down: 0}}
        ]
    },
    
    laughing: {
        title: 'Laughing',
        model: [
            {character: ':', canvas: {height: 1, width: 1, right: 0, down: 0}},
            {character: 'D',canvas: {height: 1, width: 1, right: 0, down: 0}, itemStyleFix: {top: 0.1}}
        ]
    },
    
    tears_of_happiness: {
        title: 'Tears of happiness',
        model: [
            {character: ':', canvas: {height: 1, width: 1, right: 0, down: 0}},
            {character: '\'', canvas: {height: 1, width: 1, right: 0, down: 0}},
            {character: ')',canvas: {height: 1, width: 1, right: 0, down: 0}}
        ]
    },
    
    surprise: {
        title: 'Surprise',
        modelStyleFix: {left: 0.95},
        model: [
            {character: ':', canvas: {height: 1, width: 1, right: 0, down: 0}},
            {character: '-', canvas: {height: 1, width: 1, right: 0, down: 0}},
            {character: 'O', canvas: {height: 1, width: 1, right: 0, down: 0}, itemStyleFix: {top: 0.1}}
        ]
    },

    kiss: {
        title: 'Kiss',
        modelStyleFix: {left: 0.95},
        model: [
            {character: ':', canvas: {height: 1, width: 1, right: 0, down: 0}},
            {character: '-', canvas: {height: 1, width: 1, right: 0, down: 0}},
            {character: '*', canvas: {height: 1, width: 1, right: 0, down: 0}}
        ]
    },
    
    wink: {
        title: 'Wink',
        model: [
            {character: ';', canvas: {height: 1, width: 1, right: 0, down: 0}},
            {character: '-', canvas: {height: 1, width: 1, right: 0, down: 0}},
            {character: ')', canvas: {height: 1, width: 1, right: 0, down: 0}}
        ]
    },
    
    tongue_sticking_out: {
        title: 'Tongue sticking out',
        modelStyleFix: {left: 0.95},
        model: [
            {character: ':', canvas: {height: 1, width: 1, right: 0, down: 0}},
            {character: '-', canvas: {height: 1, width: 1, right: 0, down: 0}},
            {character: 'P', canvas: {height: 1, width: 1, right: 0, down: 0}}
        ]
    },    
    
    angel: {
        title: 'Angel',
        modelStyleFix: {left: 0.90},
        model: [
            {character: 'O', canvas: {height: 1, width: 1, right: 0, down: 0}, itemStyleFix: {top: 0.1}},
            {character: ':', canvas: {height: 1, width: 1, right: 0, down: 0}},
            {character: '-', canvas: {height: 1, width: 1, right: 0, down: 0}},
            {character: ')', canvas: {height: 1, width: 1, right: 0, down: 0}}
        ]
    },
    
    evil: {
        title: 'Evil',
        modelStyleFix: {left: 0.90},
        model: [
            {character: '>', canvas: {height: 1, width: 1, right: 0, down: 0}, itemStyleFix: {top: 0.1}},
            {character: ':', canvas: {height: 1, width: 1, right: 0, down: 0}},
            {character: '-', canvas: {height: 1, width: 1, right: 0, down: 0}},
            {character: ')', canvas: {height: 1, width: 1, right: 0, down: 0}}
        ]
    },
    
    rose: {
        title: 'Rose',
        modelStyleFix: {left: 0.75},
        model: [
            {character: '@', canvas: {height: 1, width: 1, right: 0, down: 0}},
            {character: '}', canvas: {height: 1, width: 1, right: 0, down: 0}},
            {character: '-', canvas: {height: 0.3, width: 1, right: 0, down: -1}, itemStyleFix: {top: 0.3}},
            {character: '>', canvas: {height: 1, width: 1, right: 0, down: 0}, itemStyleFix: {top: 0.1}},
            {character: '-', canvas: {height: 0.3, width: 1, right: 0, down: -1}, itemStyleFix: {top: 0.3}},
            {character: '-', canvas: {height: 0.3, width: 1, right: 0, down: -1}, itemStyleFix: {top: 0.3}}
        ]
    },

    shock: {
        title: 'Shock',
        modelStyleFix: {left: 0.85},
        model: [
            {character: '(', canvas: {height: 1, width: 1, right: 0, down: 0}},
            {character: 'O', canvas: {height: 1, width: 1, right: 0, down: 0}},
            {character: '¯', canvas: {height: 0.15, width: 1, right: 0, down: 0}, itemStyleFix: {top: 0.75}},
            {character: 'O', canvas: {height: 1, width: 1, right: 0, down: 0}},
            {character: ')', canvas: {height: 1, width: 1, right: 0, down: 0}}
        ]
    },
    
    troubled: {
        title: 'Troubled',
        modelStyleFix: {left: 0.85},
        model: [
            {character: '(', canvas: {height: 1, width: 1, right: 0, down: 0}},
            {character: '>', canvas: {height: 1, width: 1, right: 0, down: 0}},
            {character: '¯', canvas: {height: 0.15, width: 1, right: 0, down: 0}, itemStyleFix: {top: 0.75}},
            {character: '<', canvas: {height: 1, width: 1, right: 0, down: 0}},
            {character: ')', canvas: {height: 1, width: 1, right: 0, down: 0}}
        ]
    },
    
    excited: {
        title: 'Excited',
        modelStyleFix: {left: 0.85},
        model: [
            {character: '\\', canvas: {height: 0.8, width: 1, right: 0, down: 0}},
            {character: '(', canvas: {height: 1, width: 1, right: 0, down: 0}},
            {character: '^', canvas: {height: 0.4, width: 1, right: 0, down: -0.15}},
            {character: 'o', canvas: {height: 0.6, width: 1, right: 0, down: -0.3}, itemStyleFix: {top: 0.3}},
            {character: '^', canvas: {height: 0.4, width: 1, right: 0, down: -0.15}},
            {character: ')', canvas: {height: 1, width: 1, right: 0, down: 0}},
            {character: '/', canvas: {height: 0.8, width: 1, right: 0, down: 0}}
        ]
    },
    
    worried: {
        title: 'Worried',
        modelStyleFix: {left: 0.85},
        model: [
            {character: '(', canvas: {height: 1, width: 1, right: 0, down: 0}},
            {character: '-', canvas: {height: 0.3, width: 1, right: 0, down: -1}},
            {character: '¯', canvas: {height: 0.15, width: 1, right: 0, down: 0}, itemStyleFix: {top: 0.75}},
            {character: '-', canvas: {height: 0.3, width: 1, right: 0, down: -1}},
            {character: 'メ', canvas: {height: 1, width: 1, right: 0, down: 0}},
            {character: ')', canvas: {height: 1, width: 1, right: 0, down: 0}}
        ]
    },    
    
    shrug: {
        title: 'Shrug',
        modelStyleFix: {left: 0.75},
        model: [
            {character: '¯', canvas: {height: 0.15, width: 1, right: 0, down: 0}},
            {character: '\\',canvas: {height: 0.8, width: 1, right: 0, down: 0}},
            {character: '¯', canvas: {height: 0.15, width: 1, right: 0, down: 0}, itemStyleFix: {top: 0.75}},
            {character: '(', canvas: {height: 1, width: 1, right: 0, down: 0}},
            {character: 'ツ', canvas: {height: 1, width: 1, right: 0, down: 0}},
            {character: ')', canvas: {height: 1, width: 1, right: 0, down: 0}},
            {character: '¯', canvas: {height: 0.15, width: 1, right: 0, down: 0}, itemStyleFix: {top: 0.75}},
            {character: '/', canvas: {height: 0.8, width: 1, right: 0, down: 0}},
            {character: '¯', canvas: {height: 0.15, width: 1, right: 0, down: 0}}
        ]
    },
    
    table_flip: {
        title: 'Table flip',
        modelStyleFix: {left: 0.6},
        model: [
            {character: '(', canvas: {height: 1, width: 1, right: 0, down: 0}},
            {character: '╯', canvas: {height: 0.6, width: 1, right: 0, down: 0}},
            {character: '°', canvas: {height: 0.5, width: 1, right: 0, down: 0}},
            {character: '□', canvas: {height: 0.8, width: 1, right: 0, down: 0}},
            {character: '°', canvas: {height: 0.5, width: 1, right: 0, down: 0}},
            {character: ')', canvas: {height: 1, width: 1, right: 0, down: 0}},
            {character: '╯', canvas: {height: 0.6, width: 1, right: 0, down: 0}},
            {character: '︵', canvas: {height: 0.4, width: 1, right: 0, down: -0.85}, itemStyleFix: {top: 0.4}},
            {character: '┻', canvas: {height: 0.5, width: 0.9, right: 0, down: 0}},
            {character: '┻', canvas: {height: 0.5, width: 0.9, right: 0, down: 0}, itemStyleFix: {left: -0.1}}
        ]
    }    
}