import * as React from 'react';
import { AttachmentFileInfo } from "@pnp/sp";
import { ActionButton, IconButton } from 'office-ui-fabric-react/lib/Button';
import { ListView } from "@pnp/spfx-controls-react/lib/ListView";


export interface IAdjuntosProps {
}

export interface IAdjuntosState {
  adjuntos: AttachmentFileInfo[];
}

export default class Adjuntos extends React.Component<IAdjuntosProps, IAdjuntosState> {
  constructor(props: IAdjuntosProps) {
    super(props);

    this.state = {
      adjuntos: []
    };
  }

  public render() {
    return (
      <div>
        <input type="file"
          id="fileupload"
          style={{ display: "none" }}
          accept="image/*,.pdf, .doc, .docx, .xls, .xlsx"
          onChange={(e) => this._onAdjuntosChange(e.target.files)}
          multiple
        />

        <ActionButton
          iconProps={{ iconName: 'Attach' }}
          text="Adjuntar archivos"
          onClick={(e) => document.getElementById("fileupload").click()}
        >Adjuntar archivos</ActionButton>

        {this.state.adjuntos.length > 0 &&
          <ListView
            items={this.state.adjuntos}
            viewFields={[
              {
                name: "name",
                displayName: "Adjuntos",
                sorting: true,
                isResizable: true
              },
              {
                name: "",
                sorting: false,
                maxWidth: 30,
                render: (item: AttachmentFileInfo, index) => {
                  return (
                    <IconButton
                      iconProps={{ iconName: 'Delete' }}
                      onClick={(e) => this._removerAdjunto(index)}
                    />
                  );
                }
              }
            ]}
            iconFieldName="name"
          />
        }

      </div>
    );
  }

  /**
   * Evento al agregar archivos adjuntos
   */
  private _onAdjuntosChange = (filelist: FileList) => {

    [].forEach.call(filelist, (file: File) => {

      let reader = new FileReader();
      reader.readAsArrayBuffer(file);

      reader.onload = () => {
        this.setState({
          adjuntos: [...this.state.adjuntos, {
            name: file.name,
            content: reader.result
          }]
        });
      };
      reader.onerror = () => {
        console.error(reader.error);
      };

    });

  }

  /**
   * Evento para remover un adjunto
   */
  private _removerAdjunto = (index: number) => {
    const removidos = this.state.adjuntos.splice(index, 1);
    this.setState({
      adjuntos: this.state.adjuntos
    });
  }

}
