import {remote} from "electron";
import {Observable, fromEvent, merge, pipe, NEVER } from "rxjs";
import { map } from "rxjs/operators";
import "rxjs/add/operator/map";
import "rxjs/add/operator/do";
import {Subject} from "rxjs";

export class WindowService {
    readonly onResize: Observable<{}>;
    readonly onClose = new Subject<{}>();
    readonly onBoundsChange: Observable<Electron.Rectangle>;

    constructor() {
        if (remote) {
            const electronWindow = remote.BrowserWindow.getAllWindows()[0];

            this.onResize = merge([
                fromEvent(electronWindow, "resize"),
                fromEvent(electronWindow.webContents, "devtools-opened"),
                fromEvent(electronWindow.webContents, "devtools-closed")
            ]);


            this.onBoundsChange = merge(
                fromEvent(electronWindow, "move"),
                fromEvent(electronWindow, "resize")
            ).pipe(
                map(() => electronWindow.getBounds())
            )

            window.onbeforeunload = () => {
                electronWindow
                    .removeAllListeners()
                    .webContents
                    .removeAllListeners("devtools-opened")
                    .removeAllListeners("devtools-closed")
                    .removeAllListeners("found-in-page");

                this.onClose.next();
            };
        } else {
            this.onResize = NEVER
            this.onBoundsChange = NEVER
        }
    }
}
