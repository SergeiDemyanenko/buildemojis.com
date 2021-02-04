
let data = {
    smile: {
        title: 'Smile',
        model: [
            {character: ':', canvas: {height: 1, witdth: 1, right: 0, down: 0}},
            {character: ')',canvas: {height: 1, witdth: 1, right: 0, down: 0}}
        ]
    },
    
    laughing: {
        title: 'Laughing',
        model: [
            {character: ':', canvas: {height: 1, witdth: 1, right: 0, down: 0}},
            {character: 'D',canvas: {height: 1, witdth: 1, right: 0, down: 0}, item: {top: 0.1}}
        ]
    },
    
    tears_of_happiness: {
        title: 'Tears of happiness',
        model: [
            {character: ':', canvas: {height: 1, witdth: 1, right: 0, down: 0}},
            {character: '\'', canvas: {height: 1, witdth: 1, right: 0, down: 0}},
            {character: ')',canvas: {height: 1, witdth: 1, right: 0, down: 0}}
        ]
    },
    
    surprise: {
        title: 'Surprise',
        model: [
            {character: ':', canvas: {height: 1, witdth: 1, right: 0, down: 0}},
            {character: '-', canvas: {height: 1, witdth: 1, right: 0, down: 0}},
            {character: 'O', canvas: {height: 1, witdth: 1, right: 0, down: 0}, item: {top: 0.1}}
        ]
    },

    kiss: {
        title: 'Kiss',
        model: [
            {character: ':', canvas: {height: 1, witdth: 1, right: 0, down: 0}},
            {character: '-', canvas: {height: 1, witdth: 1, right: 0, down: 0}},
            {character: '*', canvas: {height: 1, witdth: 1, right: 0, down: 0}}
        ]
    },
    
    wink: {
        title: 'Wink',
        model: [
            {character: ';', canvas: {height: 1, witdth: 1, right: 0, down: 0}},
            {character: '-', canvas: {height: 1, witdth: 1, right: 0, down: 0}},
            {character: ')', canvas: {height: 1, witdth: 1, right: 0, down: 0}}
        ]
    },
    
    tongue_sticking_out: {
        title: 'Tongue sticking out',
        model: [
            {character: ':', canvas: {height: 1, witdth: 1, right: 0, down: 0}},
            {character: '-', canvas: {height: 1, witdth: 1, right: 0, down: 0}},
            {character: 'P', canvas: {height: 1, witdth: 1, right: 0, down: 0}}
        ]
    },    
    
    angel: {
        title: 'Angel',
        model: [
            {character: 'O', canvas: {height: 1, witdth: 1, right: 0, down: 0}, item: {top: 0.1}},
            {character: ':', canvas: {height: 1, witdth: 1, right: 0, down: 0}},
            {character: '-', canvas: {height: 1, witdth: 1, right: 0, down: 0}},
            {character: ')', canvas: {height: 1, witdth: 1, right: 0, down: 0}}
        ]
    },
    
    evil: {
        title: 'Evil',
        model: [
            {character: '>', canvas: {height: 1, witdth: 1, right: 0, down: 0}, item: {top: 0.1}},
            {character: ':', canvas: {height: 1, witdth: 1, right: 0, down: 0}},
            {character: '-', canvas: {height: 1, witdth: 1, right: 0, down: 0}},
            {character: ')', canvas: {height: 1, witdth: 1, right: 0, down: 0}}
        ]
    },
    
    rose: {
        title: 'Rose',
        model: [
            {character: '@', canvas: {height: 1, witdth: 1, right: 0, down: 0}},
            {character: '}', canvas: {height: 1, witdth: 1, right: 0, down: 0}},
            {character: '-', canvas: {height: 0.3, witdth: 1, right: 0, down: -1}, item: {top: 0.3}},
            {character: '>', canvas: {height: 1, witdth: 1, right: 0, down: 0}, item: {top: 0.1}},
            {character: '-', canvas: {height: 0.3, witdth: 1, right: 0, down: -1}, item: {top: 0.3}},
            {character: '-', canvas: {height: 0.3, witdth: 1, right: 0, down: -1}, item: {top: 0.3}}
        ]
    },

    shock: {
        title: 'Shock',
        model: [
            {character: '(', canvas: {height: 1, witdth: 1, right: 0, down: 0}},
            {character: 'O', canvas: {height: 1, witdth: 1, right: 0, down: 0}},
            {character: '¯', canvas: {height: 0.15, witdth: 1, right: 0, down: 0}, item: {top: 0.75}},
            {character: 'O', canvas: {height: 1, witdth: 1, right: 0, down: 0}},
            {character: ')', canvas: {height: 1, witdth: 1, right: 0, down: 0}}
        ]
    },
    
    troubled: {
        title: 'Troubled',
        model: [
            {character: '(', canvas: {height: 1, witdth: 1, right: 0, down: 0}},
            {character: '>', canvas: {height: 1, witdth: 1, right: 0, down: 0}},
            {character: '¯', canvas: {height: 0.15, witdth: 1, right: 0, down: 0}, item: {top: 0.75}},
            {character: '<', canvas: {height: 1, witdth: 1, right: 0, down: 0}},
            {character: ')', canvas: {height: 1, witdth: 1, right: 0, down: 0}}
        ]
    },
    
    excited: {
        title: 'Excited',
        model: [
            {character: '\\', canvas: {height: 0.8, witdth: 1, right: 0, down: 0}},
            {character: '(', canvas: {height: 1, witdth: 1, right: 0, down: 0}},
            {character: '^', canvas: {height: 0.4, witdth: 1, right: 0, down: -0.15}},
            {character: 'o', canvas: {height: 0.6, witdth: 1, right: 0, down: -0.3}, item: {top: 0.3}},
            {character: '^', canvas: {height: 0.4, witdth: 1, right: 0, down: -0.15}},
            {character: ')', canvas: {height: 1, witdth: 1, right: 0, down: 0}},
            {character: '/', canvas: {height: 0.8, witdth: 1, right: 0, down: 0}}
        ]
    },
    
    worried: {
        title: 'Worried',
        model: [
            {character: '(', canvas: {height: 1, witdth: 1, right: 0, down: 0}},
            {character: '-', canvas: {height: 0.3, witdth: 1, right: 0, down: -1}},
            {character: '¯', canvas: {height: 0.15, witdth: 1, right: 0, down: 0}, item: {top: 0.75}},
            {character: '-', canvas: {height: 0.3, witdth: 1, right: 0, down: -1}},
            {character: 'メ', canvas: {height: 1, witdth: 1, right: 0, down: 0}},
            {character: ')', canvas: {height: 1, witdth: 1, right: 0, down: 0}}
        ]
    },    
    
    shrug: {
        title: 'Shrug',
        model: [
            {character: '¯', canvas: {height: 0.15, witdth: 1, right: 0, down: 0}},
            {character: '\\',canvas: {height: 0.8, witdth: 1, right: 0, down: 0}},
            {character: '¯', canvas: {height: 0.15, witdth: 1, right: 0, down: 0}, item: {top: 0.75}},
            {character: '(', canvas: {height: 1, witdth: 1, right: 0, down: 0}},
            {character: 'ツ', canvas: {height: 1, witdth: 1, right: 0, down: 0}},
            {character: ')', canvas: {height: 1, witdth: 1, right: 0, down: 0}},
            {character: '¯', canvas: {height: 0.15, witdth: 1, right: 0, down: 0}, item: {top: 0.75}},
            {character: '/', canvas: {height: 0.8, witdth: 1, right: 0, down: 0}},
            {character: '¯', canvas: {height: 0.15, witdth: 1, right: 0, down: 0}}
        ]
    },
    
    table_flip: {
        title: 'Table flip',
        model: [
            {character: '(', canvas: {height: 1, witdth: 1, right: 0, down: 0}},
            {character: '╯', canvas: {height: 0.6, witdth: 1, right: 0, down: 0}},
            {character: '°', canvas: {height: 0.5, witdth: 1, right: 0, down: 0}},
            {character: '□', canvas: {height: 0.8, witdth: 1, right: 0, down: 0}},
            {character: '°', canvas: {height: 0.5, witdth: 1, right: 0, down: 0}},
            {character: ')', canvas: {height: 1, witdth: 1, right: 0, down: 0}},
            {character: '╯', canvas: {height: 0.6, witdth: 1, right: 0, down: 0}},
            {character: '︵', canvas: {height: 0.4, witdth: 1, right: 0, down: -0.85}, item: {top: 0.4}},
            {character: '┻', canvas: {height: 0.5, witdth: 0.9, right: 0, down: 0}},
            {character: '┻', canvas: {height: 0.5, witdth: 0.9, right: 0, down: 0}, item: {left: -0.1}}
        ]
    }    
}