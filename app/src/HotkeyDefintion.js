import { Hotkey, Hotkeys, HotkeysTarget } from "@blueprintjs/core";
import * as React from "react";
 
//@HotkeysTarget
class HotkeyComponent extends React.Component {
    render() {
        return <div>Custom content</div>;
    }
 
    renderHotkeys() {
        return(<Hotkeys>
            <Hotkey
                global={true}
                combo="shift + a"
                label="Be awesome all the time"
                onKeyDown={() => alert("Awesome!")}
            />
            <Hotkey
                group="Fancy shortcuts"
                combo="shift + f"
                label="Be fancy only when focused"
                onKeyDown={() => alert("So fancy!")}
            />
            </Hotkeys>
        );
    }
}

export{HotkeyComponent};