import { Injectable } from '@angular/core';
import { ElectronService } from 'ngx-electron';

@Injectable()
export class ElectronWrapperService {
  constructor(private electronService: ElectronService) {}

  getDataOnce(
    senderChannelName: string,
    senderArgs: any,
    recieverChannelName: string
  ): Promise<any> {
    return new Promise((res, rej) => {
      if (this.electronService.isElectronApp) {
        try {
          this.electronService.ipcRenderer.send(senderChannelName, senderArgs);
          this.electronService.ipcRenderer.once(
            recieverChannelName,
            (event, data) => {
              res({ event, data });
            }
          );
        } catch (e) {
          rej('Error occured' + e);
        }
      } else {
        rej('No electron app found!');
      }
    });
  }
}
