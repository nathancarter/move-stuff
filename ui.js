
import { popup, unPopup, popupIsVisible } from './popup.js'
import { levels } from './levels.js'
import { Int3 } from './int3.js'

let game = null
export const setGame = g => game = g

export const showWelcomeDialog = () => popup( `
    <h1>Welcome to this experimental game.</h1>
    <p>Press enter &rightarrow; choose a level to play</p>
    <p>Press ? (question mark) &rightarrow; get help</p>
    <h4>Enjoy!</h4>
`, game.view.domElement )

const showLevelChoiceDialog = () => popup( `
    <h1>Choose a level to play or edit:</h1>
    <select class="focus-me" onchange="levelPicked(this);">
        <option value="null">(choose one)</option>
        ${levels.map(x=>'<option value="'+x.name+'">'+x.name+'</option>').join('\n')}
    </select>
`, game.view.domElement )

let currentLevel = null
window.levelPicked = ( selectElement ) => {
    if ( selectElement.value == 'null' ) return
    currentLevel = levels.find( level => level.name == selectElement.value )
    game.setState( currentLevel )
    unPopup()
}

const showLevelJSON = () => {
    const popupWindow = popup( `
        <h1>Level definition in JSON format</h1>
        <textarea id="levelJSON" readonly class="focus-me"
                  style="width: 100%; height: 20em;"
        >${JSON.stringify( game.state(), null, 4 )}</textarea>
    `, game.view.domElement )
    popupWindow.querySelector( '#levelJSON' ).select()
}

const showHelpDialog = () => popup( `
    <h1>Controls</h1>
    <table style="width: 100%;" border=1 cellspacing=0 cellpadding=10>
        <tr style="background-color: #dddddd;">
            <th>Keyboard/mouse action</th>
            <th>Result</th>
        </tr>
        <tr>
            <td>Click and drag</td>
            <td>Rotate viewpoint</td>
        </tr>
        <tr>
            <td>Scroll mouse wheel</td>
            <td>Zoom view in/out</td>
        </tr>
        <tr>
            <td>Enter</td>
            <td>Choose a level to edit or play</td>
        </tr>
        <tr>
            <td>?</td>
            <td>Show this help</td>
        </tr>
        <tr>
            <td>Escape</td>
            <td>Hide this help</td>
        </tr>
        <tr>
            <th colspan=2 style="background-color: #eeeeee;">
                <center>While playing a level</center>
            </th>
        </tr>
        <tr>
            <td>Click an object</td>
            <td>Activate/use the object</td>
        </tr>
        <tr>
            <td>r</td>
            <td>Reset the current level</td>
        </tr>
        <tr>
            <td>Tab</td>
            <td>Turn on edit mode</td>
        </tr>
        <tr>
            <th colspan=2 style="background-color: #eeeeee;">
                <center>While editing a level</center>
            </th>
        </tr>
        <tr>
            <td>Arrow keys</td>
            <td>Move 3d cursor (white wireframe) horizontally</td>
        </tr>
        <tr>
            <td>w, s</td>
            <td>Move 3d cursor (white wireframe) vertically</td>
        </tr>
        <tr>
            <td>Click an object</td>
            <td>Move the cursor there</td>
        </tr>
        <tr>
            <td>1</td>
            <td>Insert a floor block</td>
        </tr>
        <tr>
            <td>2</td>
            <td>Insert a game piece</td>
        </tr>
        <tr>
            <td>3</td>
            <td>Insert a goal</td>
        </tr>
        <tr>
            <td>4</td>
            <td>Insert a spinner</td>
        </tr>
        <tr>
            <td>5</td>
            <td>Insert a poker</td>
        </tr>
        <tr>
            <td>Backspace</td>
            <td>Delete object under cursor</td>
        </tr>
        <tr>
            <td>j, k, l</td>
            <td>Cycle features of object under cursor (though not all objects
                have three features to adjust)</td>
        </tr>
        <tr>
            <td>x</td>
            <td>Cut item under cursor</td>
        </tr>
        <tr>
            <td>c</td>
            <td>Copy item under cursor</td>
        </tr>
        <tr>
            <td>v</td>
            <td>Paste copied/cut item to cursor location</td>
        </tr>
        <tr>
            <td>Slash (/)</td>
            <td>Show JSON code for current level</td>
        </tr>
        <tr>
            <td>Tab</td>
            <td>Turn off edit mode</td>
        </tr>
    </table>
`, game.view.domElement )

const generalResponses = {
    'Enter'      : showLevelChoiceDialog,
    'Escape'     : unPopup,
    '?'          : showHelpDialog,
    'Tab'        : () => game.setEditing( !game.isEditing() ),
}
const editingResponses = {
    'ArrowLeft'  : () => game.moveCursor( Int3.L ),
    'ArrowRight' : () => game.moveCursor( Int3.R ),
    'ArrowUp'    : () => game.moveCursor( Int3.F ),
    'ArrowDown'  : () => game.moveCursor( Int3.B ),
    'w'          : () => game.moveCursor( Int3.U ),
    's'          : () => game.moveCursor( Int3.D ),
    '1'          : () => game.addFromJSON( { type : 'floor' }, true ),
    '2'          : () => game.addFromJSON( { type : 'token' }, true ),
    '3'          : () => game.addFromJSON( { type : 'goal' }, true ),
    '4'          : () => game.addFromJSON( { type : 'spinner' }, true ),
    '5'          : () => game.addFromJSON( { type : 'poker' }, true ),
    'Backspace'  : () => game.deletePieceAtCursor(),
    'j'          : target => target?.cycleFinite( 0, 1 ),
    'k'          : target => target?.cycleFinite( 1, 1 ),
    'l'          : target => target?.cycleFinite( 2, 1 ),
    '/'          : showLevelJSON,
    'x'          : () => game.cut(),
    'c'          : () => game.copy(),
    'v'          : () => game.paste()
}
const playingResponses = {
    'r'          : () => game.setState( currentLevel )
}
document.addEventListener( 'keydown', event => {
    if ( event.ctrlKey || event.metaKey ) return
    if ( popupIsVisible() && !['Escape','Enter','?'].includes( event.key ) )
        return
    const responses = {
        ...generalResponses,
        ...( game.isEditing() ? editingResponses : playingResponses )
    }
    if ( responses.hasOwnProperty( event.key ) ) {
        responses[event.key]( game.cursor && game.pieceAt( game.cursor.pos() ) )
        return event.preventDefault()
    }
} )

document.addEventListener( 'click', event => {
    // If they didn't click anything, quit
    const clicked = game.objectsUnderMouse( event )
    if ( clicked.length == 0 ) return
    // If it wasn't a piece on the board, quit
    const target = game.board.find( piece => piece.repr == clicked[0] )
    if ( !target ) return
    // If we're in edit mode, clicking moves the cursor
    if ( game.isEditing() && game.cursor ) {
        game.moveCursor( target.pos().minus( game.cursor.pos() ) )
    // If the game is animating something, it can't take any "play" clicks
    } else if ( game.isAnimating() ) {
        return
    // If we're not in edit mode, clicking uses objects
    } else {
        target?.play( 'use' )
    }
} )
