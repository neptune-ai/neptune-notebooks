import {Kernel, KernelMessage} from '@jupyterlab/services';
import {IClientSession} from '@jupyterlab/apputils';
import {INeptuneConnectionParams} from './connection';
import {NeptuneContent} from "./content";


export class NeptuneSession {

    private readonly session: IClientSession;
    private readonly content: NeptuneContent;

    constructor(session: IClientSession, content: NeptuneContent) {
        this.session = session;
        this.content = content;
        // noinspection JSIgnoredPromiseFromCall
        this.registerCommListener();
    }

    runInitializationCode(params: INeptuneConnectionParams): Kernel.IShellFuture<KernelMessage.IExecuteRequestMsg, KernelMessage.IExecuteReplyMsg> {
        return this.session.kernel.requestExecute({
            code: getInitializationCode(params, this.content.getNotebookPath())
        });
    }

    async registerCommListener(): Promise<void> {
        return this.session.ready.then(() => {
            this.session.kernel.registerCommTarget(
                "neptune_comm",
                (comm: Kernel.IComm, open: KernelMessage.ICommOpenMsg) => {
                    comm.onMsg = (msg: KernelMessage.ICommMsgMsg): void => {
                        if (msg.content.data.message_type === "CHECKPOINT_CREATED") {
                            console.log("Checkpoint created");
                            console.log(msg);
                        }
                    };
                });
        });
    }

}


export function getInitializationCode(params: INeptuneConnectionParams, notebookPath: string): string {
    const {
        apiToken,
        project,
        notebookId
    } = params;
    return `import os
${envEntry('NEPTUNE_API_TOKEN', apiToken)}
${envEntry('NEPTUNE_PROJECT', project)}
${envEntry('NEPTUNE_NOTEBOOK_ID', notebookId)}
${envEntry('NEPTUNE_NOTEBOOK_PATH', notebookPath)}`;
}


function envEntry(key, value) {
    const disableComment = value ? '' : '# ';
    const keyValue = value ? `="${value}"` : '';

    return `${disableComment}os.environ['${key}']${keyValue}`;
}
