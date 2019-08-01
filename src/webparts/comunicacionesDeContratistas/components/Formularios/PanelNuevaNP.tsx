import { DefaultButton, PrimaryButton, ActionButton, IconButton, IButtonProps } from 'office-ui-fabric-react/lib/Button';
import { Panel, PanelType } from 'office-ui-fabric-react/lib/Panel';
import { Label } from 'office-ui-fabric-react/lib/Label';
import { TextField } from 'office-ui-fabric-react/lib/TextField';
import { RichText } from "@pnp/spfx-controls-react/lib/RichText";
import { Spinner, SpinnerSize } from 'office-ui-fabric-react/lib/Spinner';
import { ListView } from "@pnp/spfx-controls-react/lib/ListView";

import * as React from 'react';
import { sp, ItemAddResult, AttachmentFileInfo, AttachmentFileAddResult } from "@pnp/sp";
import styles from "./Panel.module.scss";

import { IComunicacion } from '../Comunicaciones/IComunicacion';
import { IEvento } from '../Eventos/IEvento';
import Adjuntos from "./Adjuntos";


/**
 * Propiedades del Panel
 */
interface IPanelProps {
  visible: boolean;
  evento: IEvento;
  enviarA: string;
  ocultar: () => void;
  onEnviada: (comunicacion: IComunicacion) => void;
}

/**
 * Estado del panel
 */
interface IPanelState {
  loading: boolean;
  identificador: number;
  titulo: string;
  cuerpo: string;
  adjuntos: AttachmentFileInfo[];
}

/**
 * Panel de comunicaciones:
 */
export default class PanelNuevaNP extends React.Component<IPanelProps, IPanelState> {

  private oAdjuntos: React.RefObject<Adjuntos>;

  constructor(props: IPanelProps) {
    super(props);

    this.state = {
      loading: false,
      identificador: 1,
      titulo: '',
      cuerpo: '',
      adjuntos: []
    };

    this.oAdjuntos = React.createRef();
  }

  /**
   * Genero un nuevo identificador incremental 
   */
  private _getIdentificador() {
    let filtro = "Contratista eq '" + this.props.evento.ContratistaNombre + "' and TipoComunicacion eq 'NP'";
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
   * Al cambiar de evento reinicio el estado
   */
  public componentDidUpdate(prevProps: IPanelProps, prevState: IPanelState) {
    if (this.props.evento && prevProps.evento != this.props.evento) {
      this.setState({
        titulo: '',
        cuerpo: '',
        adjuntos: []
      });
      this._getIdentificador();
    }
  }

  /**
   * Imprimo el panel con sus lógicas de presentación
   */
  public render() {
    const { evento } = this.props;

    return (
      <div>
        {evento &&
          <Panel
            className={styles.panel}
            isOpen={this.props.visible}
            type={PanelType.medium}
            onDismiss={this._cancelarNuevaNota}
            isFooterAtBottom={true}
            isLightDismiss={true}
            headerText={"Nueva Nota de Pedido en " + evento.Title}
            closeButtonAriaLabel="Cerrar"
            onRenderFooterContent={this._onRenderFooterContent}
          >

            <TextField prefix="Identificador" value={this.state.identificador.toString()} />
            <br />

            <Label className={styles.tituloCom}>Asunto</Label>
            <TextField placeholder={evento.Title} value={this.state.titulo} onChange={(prop, newValue) => this._onTituloChange(newValue)} />
            <br />

            <Label className={styles.tituloCom}>Nota de pedido</Label>
            <RichText className={styles.cuerpoCom} value={this.state.cuerpo} onChange={(text) => this._onCuerpoChange(text)} isEditMode={true} />
            <br />

            <Adjuntos ref={this.oAdjuntos} />

          </Panel>
        }
      </div>
    );
  }

  /**
   * Imprimo el pie del panel con las acciones posibles para el usuario
   */
  private _onRenderFooterContent = (): JSX.Element => {
    const { loading, titulo, cuerpo } = this.state;

    return (
      <div>
        {!loading &&
          <div>
            <div>
              {cuerpo.length > 20 &&
                <PrimaryButton iconProps={{ iconName: 'Mail' }} onClick={this._enviarNuevaNota} style={{ marginRight: '8px' }}>Enviar NP</PrimaryButton>
              }
              <DefaultButton iconProps={{ iconName: 'Cancel' }} onClick={this._cancelarNuevaNota}>Cancelar</DefaultButton>
            </div>
          </div>
        }
        {loading &&
          <Spinner size={SpinnerSize.large} />
        }
      </div>
    );
  }


  /**
   * Evento para crear una nueva nota de pedido (NP)
   */
  private _enviarNuevaNota = () => {

    this.setState({ loading: true });

    let e = this.props.evento;
    let np: IComunicacion = {

      Region: e.Region,
      Subregion: e.Subregion,
      Contratista: e.ContratistaNombre,
      ContratistaID: e.ContratistaID,
      EventoID: e.ID,
      EventoId: e.ID,

      Identificador: this.state.identificador,
      Title: this.state.titulo.length > 1 ? this.state.titulo : e.Title,
      Cuerpo: this.state.cuerpo,
      TipoComunicacion: "NP",
      EventoTipo: e.TipoEvento,
      EstadoTeco: "Nueva",
      EstadoContratista: "Enviada",
      FechaEnvio: new Date().toISOString(),
      Email: this.props.enviarA

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

        this.props.ocultar();
        this.setState({
          loading: false,
          titulo: '',
          cuerpo: '',
          adjuntos: []
        });

        this.props.onEnviada(np);

      });

  }

  /**
   * Al cancelar cierro el panel
   */
  private _cancelarNuevaNota = () => {
    this.props.ocultar();
    this.setState({
      loading: false,
      titulo: '',
      cuerpo: '',
      adjuntos: []
    });
  }

  /**
   * Almaceno el título en el estado del componente
   */
  private _onTituloChange = (newText: string) => {
    this.setState({
      titulo: newText
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