import { DefaultButton, PrimaryButton, IButtonProps, IconButton } from 'office-ui-fabric-react/lib/Button';
import { Panel, PanelType } from 'office-ui-fabric-react/lib/Panel';
import { Label } from 'office-ui-fabric-react/lib/Label';
import { TextField } from 'office-ui-fabric-react/lib/TextField';
import { ListView } from "@pnp/spfx-controls-react/lib/ListView";
import { RichText } from "@pnp/spfx-controls-react/lib/RichText";
import { Spinner, SpinnerSize } from 'office-ui-fabric-react/lib/Spinner';

import * as React from 'react';
import { sp, ItemAddResult } from "@pnp/sp";
import styles from "./Panel.module.scss";

import { WebPartContext } from "@microsoft/sp-webpart-base";
import { IComunicacion } from '../Comunicaciones/IComunicacion';
import { IEvento } from '../Eventos/IEvento';
import { IListItemAttachmentFile } from '@pnp/spfx-controls-react/lib/ListItemAttachments';
import Adjuntos from "./Adjuntos";


/**
 * Propiedades del Panel
 */
interface IPanelProps {
  contexto: WebPartContext;
  visible: boolean;
  evento: IEvento;
  comunicacion: IComunicacion;
  enviarA: string;
  ocultar: () => void;
  onEnviada: (comunicacion: IComunicacion) => void;
}

/**
 * Estado del panel
 */
interface IPanelState {
  responder: boolean;
  loading: boolean;
  identificador: number;
  cuerpo: string;
  adjuntos: IListItemAttachmentFile[];
}

/**
 * Panel de comunicaciones:
 * Es el panel laterial donde se vera el información de la cominucación seleccionada.
 * Tambien encapsula las acciones de 'darse por notificado' 
 * y la de responder a una orden de servicio
 */
export default class PanelVerOS extends React.Component<IPanelProps, IPanelState> {

  private oAdjuntos: React.RefObject<Adjuntos>;

  constructor(props: IPanelProps) {
    super(props);

    this.state = {
      responder: false,
      loading: false,
      identificador: 1,
      cuerpo: '',
      adjuntos: []
    };

    this.oAdjuntos = React.createRef();
  }

  /**
   * Obtiene los adjuntos de la comunicacion seleccionada
   */
  private _getAdjuntos() {
    let item = sp.web.lists.getByTitle("Comunicaciones").items.getById(this.props.comunicacion.ID);

    item.attachmentFiles.get().then((adjuntos: IListItemAttachmentFile[]) => {
      this.setState({ adjuntos });
    });
  }

  /**
   * Genero un nuevo identificador incremental 
   */
  private _getIdentificador() {
    let filtro = "Contratista eq '" + this.props.comunicacion.Contratista + "' and TipoComunicacion eq 'NP'";
    sp.web.lists.getByTitle("Comunicaciones").items
      .filter(filtro)
      .orderBy('Identificador', false)
      .top(1)
      .get()
      .then((com: IComunicacion[]) => {
        if (com.length > 0) {
          this.setState({ identificador: com[0].Identificador + 1 });
        }
      });
  }

  /**
   * Al montarse el componente y al cambiar las propiedades poluciono las comunicaciones
   */
  public componentDidUpdate(prevProps: IPanelProps, prevState: IPanelState) {
    if (this.props.comunicacion && prevProps.comunicacion != this.props.comunicacion) {
      this._getAdjuntos();
    }
  }

  /**
   * Imprimo el panel con sus lógicas de presentación
   */
  public render() {
    const { comunicacion } = this.props;

    return (
      <div>
        {comunicacion &&
          <Panel
            className={styles.panel}
            isOpen={this.props.visible}
            type={PanelType.medium}
            onDismiss={this._cerrar}
            isFooterAtBottom={true}
            isLightDismiss={true}
            headerText={comunicacion.TipoComunicacion + " N°" + comunicacion.Identificador}
            closeButtonAriaLabel="Cerrar"
            onRenderFooterContent={this._onRenderFooterContent}
          >
            <Label className={styles.tituloCom}>{comunicacion.Title}</Label>

            <table style={{ width: '100%' }}>
              {comunicacion.NPA &&
                <tr>
                  <td><TextField prefix="NPA" value={comunicacion.NPA} /></td>
                  <td><TextField prefix="Plazo" value={comunicacion.Plazo ? new Date(comunicacion.Plazo).toLocaleDateString() : ''} /></td>
                </tr>}
              {comunicacion.PEP &&
                <tr>
                  <td><TextField prefix="PEP" value={comunicacion.PEP} /></td>
                  <td><TextField prefix="Grafo" value={comunicacion.Grafo} /></td>
                </tr>}
              {comunicacion.Reserva &&
                <tr>
                  <td><TextField prefix="Reserva" value={comunicacion.Reserva} /></td>
                  <td><TextField prefix="OE" value={comunicacion.OE} /></td>
                </tr>}
            </table>
            <br />

            {!this.state.responder &&
              <div>
                <div dangerouslySetInnerHTML={{ __html: comunicacion.Cuerpo }} />
                <div>
                  {this.state.adjuntos.length > 0 &&
                    <ListView
                      items={this.state.adjuntos}
                      viewFields={[
                        {
                          name: "FileName",
                          displayName: "Adjuntos",
                          sorting: true,
                          isResizable: true
                        },
                        {
                          name: "",
                          sorting: false,
                          maxWidth: 30,
                          render: (item: IListItemAttachmentFile, index) => {
                            return (
                              <IconButton
                                iconProps={{ iconName: 'CloudDownload' }}
                                href={item.ServerRelativeUrl}
                              />
                            );
                          }
                        }
                      ]}
                      iconFieldName="FileName"
                    />
                  }
                </div>
              </div>
            }

            {this.state.responder &&
              <div>
                <Label className={styles.tituloCom}>Respuesta a la OS</Label>
                <TextField prefix="Identificador" value={this.state.identificador.toString()} />
                <RichText className={styles.cuerpoCom} onChange={(text) => this._onCuerpoChange(text)} isEditMode={true} />
                <Adjuntos ref={this.oAdjuntos} />
              </div>
            }

          </Panel>
        }
      </div>
    );
  }

  /**
   * Imprimo el pie del panel con las acciones posibles para el usuario
   */
  private _onRenderFooterContent = (): JSX.Element => {
    const { comunicacion } = this.props;
    const { loading, cuerpo } = this.state;

    return (
      <div>
        {!loading &&
          <div>
            {comunicacion.EstadoContratista != 'Notificado' && comunicacion.TipoComunicacion == "OS" &&
              <PrimaryButton iconProps={{ iconName: 'Like' }} onClick={this._notificar} style={{ marginRight: '8px' }}>Notificado</PrimaryButton>
            }
            {comunicacion.EstadoContratista == 'Notificado' && !this.state.responder &&
              <PrimaryButton iconProps={{ iconName: 'PencilReply' }} onClick={this._responder} style={{ marginRight: '8px' }}>Responder</PrimaryButton>
            }
            {this.state.responder &&
              <div>
                {cuerpo.length > 20 &&
                  <PrimaryButton iconProps={{ iconName: 'MailReplyMirrored' }} onClick={this._enviarRespuesta} style={{ marginRight: '8px' }}>Enviar respuesta</PrimaryButton>
                }
                <DefaultButton iconProps={{ iconName: 'Cancel' }} onClick={this._cancelarRespuesta}>Cancelar</DefaultButton>
              </div>
            }
          </div>
        }
        {loading &&
          <Spinner size={SpinnerSize.large} />
        }
      </div>
    );
  }

  /**
   * La acción de 'Notificar' cambia el estado del contratista y del personal de teco
   * en 'Notificado'
   */
  private _notificar = (): void => {
    this.setState({ loading: true });

    let estado = "Notificado";
    let list = sp.web.lists.getByTitle("Comunicaciones");

    list.items.getById(this.props.comunicacion.ID).update({
      EstadoContratista: estado,
      EstadoTeco: estado
    }).then(i => {
      this.props.comunicacion.EstadoContratista = estado;
      this.props.comunicacion.EstadoTeco = estado;
      this.props.ocultar();
    });

    this.setState({ loading: false });
  }

  /**
   * La acción de responder sólo cambia la presentación del formulario
   */
  private _responder = () => {
    this._getIdentificador();
    this.setState({
      responder: true
    });
  }

  /**
   * Al cancelar vuelvo al estado original del form
   */
  private _cancelarRespuesta = () => {
    this.setState({
      responder: false
    });
  }

  /**
   * Al cancelar vuelvo al estado original del form
   */
  private _cerrar = () => {
    this.props.ocultar();
    this.setState({
      responder: false,
      loading: false,
      cuerpo: '',
      adjuntos: []
    });
  }


  /**
   * Evento para crear la respuesta a una orden de servicio (OS)
   */
  private _enviarRespuesta = () => {

    this.setState({ loading: true });

    let c = this.props.comunicacion;
    let np: IComunicacion = {

      Region: c.Region,
      Subregion: c.Subregion,
      Contratista: c.Contratista,
      ContratistaID: c.ContratistaID,
      EventoID: c.EventoID,
      EventoId: c.EventoID,

      Identificador: this.state.identificador,
      Title: c.Title,
      Cuerpo: this.state.cuerpo,
      TipoComunicacion: "NP",
      EventoTipo: c.EventoTipo,
      EstadoTeco: "Nueva",
      EstadoContratista: "Enviada",
      FechaEnvio: new Date().toISOString(),
      Email: this.props.enviarA,
      RelacionadaId: c.ID,

      NPA: c.NPA,
      PEP: c.PEP,
      Grafo: c.Grafo,
      Reserva: c.Reserva,
      OE: c.OE

    };

    sp.web.lists
      .getByTitle("Comunicaciones").items
      .add(np)
      .then((iar: ItemAddResult) => {

        console.info(iar);
        np.ID = iar.data.ID;
        np.DisplayEnvio = new Date(iar.data.FechaEnvio).toLocaleString();

        iar.item.attachmentFiles.addMultiple(this.oAdjuntos.current.state.adjuntos).then((r) => {
          console.info(r);
        });

        this.setState({ loading: false, responder: false });
        this.props.ocultar();
        this.props.onEnviada(np);

      });

  }

  /**
   * Almaceno el cuerpo en el estado del componente
   */
  private _onCuerpoChange = (newText: string) => {
    this.setState({
      cuerpo: newText
    });
    return newText;
  }
}