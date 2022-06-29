import { CallbackCancel } from './Webapi.callback';
import { unixTime } from '../base/Fuctions';
import { Put, PutForm, ObjectVersionChanged } from "./Webapi";

export interface IHeartbeatAudio {
    HeartBeat: string
    Audio: Blob
}

export class HeartbeatAudioModel implements IHeartbeatAudio {

    constructor(public HeartBeat: string, public Audio: Blob) { }

    private PutCheck = (): boolean => this.Audio.size > 0 && this.HeartBeat.length > 0;

    public Put = () => {
        if (!this.PutCheck()) return;

        let form = new FormData()
        //form.append('audio', new File(this.Audio, 'recording.ogg', { 'type': 'audio/ogg; codecs=opus' }))
        form.append('audio', this.Audio)
        //form.append('audio', this.Audio)
        form.append('heartbeat', this.HeartBeat)
        PutForm(`/api/measureHeartbeatAudio`, form)
    }


}

