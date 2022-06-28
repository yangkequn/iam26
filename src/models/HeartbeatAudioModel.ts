import { CallbackCancel } from './Webapi.callback';
import { unixTime } from '../base/Fuctions';
import { Put, PutForm, ObjectVersionChanged } from "./Webapi";

export interface IHeartbeatAudio {
    HeartBeat: string
    Audio: Blob[]
}

export class HeartbeatAudioModel implements IHeartbeatAudio {

    constructor(public HeartBeat: string, public Audio: Blob[]) {    }

    private PutCheck = (): boolean => this.Audio.length > 0 && this.HeartBeat.length === this.Audio.length;

    public Put = () => {
        if (!this.PutCheck()) return;

        let form = new FormData()
        form.append('type', 'ogg')
        form.append('audio', new File(this.Audio, 'recording.ogg',{ 'type': 'audio/ogg; codecs=opus' }))
        form.append('heartbeat', this.HeartBeat)
        //JwtRequest().put(Url.CorpusFile(corpusId,"audio"), data).then(ret => console.log("excecute succ"))
        alert("form设置完毕")
        PutForm(`/api/measureHeartbeatAudio`, form)
    }


}

