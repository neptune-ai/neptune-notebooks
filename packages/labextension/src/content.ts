import {INotebookModel} from "@jupyterlab/notebook";
import {DocumentRegistry} from "@jupyterlab/docregistry";
import {JSONObject} from "@phosphor/coreutils";
import {ContentsManager} from "@jupyterlab/services";

export class NeptuneContent {

    private readonly context: DocumentRegistry.IContext<INotebookModel>;
    private readonly contentsManager: ContentsManager;

    constructor(context: DocumentRegistry.IContext<INotebookModel>,
                contentsManager: ContentsManager) {
        this.context = context;
        this.contentsManager = contentsManager;
    }

    getNotebookPath = () => {
        return this.context.path;
    };

    getNotebookContent = () => {
        return this.contentsManager.get(this.context.path, {content: true})
            .then(content => JSON.stringify(content));
    };

    getMetadata = () => {
        return this.context.ready.then(() => {
            let metadata = this.context.model.metadata.get("neptune") as NeptuneMetadata;
            if (metadata) {
                return metadata;
            } else {
                return {};
            }
        });
    };

    validateMetadata = () => {
        return this.getMetadata().then(metadata => {
            if (metadata.notebookId) {
                return Promise.resolve();
            } else {
                return Promise.reject("Missing `notebookId`");
            }
        })
    };

    updateMetadata = (update: Partial<NeptuneMetadata>) => {
        return this.context.ready.then(() => {
            let metadata = this.context.model.metadata;

            if (!metadata.has("neptune")) {
                metadata.set("neptune", {});
            }

            let neptuneMetadata = this.context.model.metadata.get("neptune") as NeptuneMetadata;

            if (update.notebookId) {
                neptuneMetadata.notebookId = update.notebookId;
            }

            this.context.model.metadata.set("neptune", neptuneMetadata as JSONObject);
        });
    }

}

interface NeptuneMetadata {

    notebookId?: string;

}
