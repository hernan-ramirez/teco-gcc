import * as React from 'react';
import { sp } from "@pnp/sp";
import styles from './Eventos.module.scss';

import { ListView, SelectionMode } from "@pnp/spfx-controls-react/lib/ListView";
import { Spinner, SpinnerSize } from 'office-ui-fabric-react/lib/Spinner';
import { IComboBoxOption } from 'office-ui-fabric-react/lib/index';

import { IEvento } from './IEvento';
import Regiones from "./Regiones";


/**
 * Propiedades de Eventos
 */
interface IEventosProps {

  /**
   * Filtra las comunicaciones por este evento
   */
  delContratista: string;

  /**
   * Devuelve el evento seleccionado
   */
  onSelected: (evento: IEvento) => void;

}

/**
 * Estado del Componente 'Eventos'
 */
interface IEventosState {

  /**
   * Listado de Eventos
   */
  eventos: IEvento[];

  /**
   * Filtro de region
   */
  region?: string;

  /**
   * Estado de carga del listado
   */
  loading: boolean;

  /**
   * Indica la respuesta a un error
   */
  error: string;
}

/**
 * Eventos
 */
export default class Eventos extends React.Component<IEventosProps, IEventosState> {

  constructor(props: IEventosProps) {
    super(props);

    this.state = {
      eventos: [],
      region: null,
      loading: false,
      error: undefined,
    };
  }

  /**
   * Obtiene los eventos via REST con PNPJS
   * https://pnp.github.io/pnpjs/
   */
  private _getItems() {

    this.setState({
      loading: true
    });

    let filtro = "ContratistaNombre eq '" + this.props.delContratista + "' and Estado eq 'Abierto'";
    if (this.state.region) {
      filtro += " and Subregion eq '" + this.state.region + "'";
    }

    sp.web.lists
      .getByTitle("Eventos").items
      .filter(filtro)
      .get()
      .then((items: IEvento[]): void => {

        this.setState({
          loading: false,
          eventos: items.map(i => {
            i.DisplayFecha = new Date(i.Modified).toLocaleDateString();
            return i;
          })
        });

      }, (error: any): void => {
        this.setState({
          loading: false,
          error: error
        });
      });

  }

  /**
   * Al montarse el componente y al cambiar las propiedades poluciono los eventos
   */
  public componentDidMount(): void {
    this._getItems();
  }
  public componentDidUpdate(prevProps: IEventosProps, prevState: IEventosState) {
    if (prevProps.delContratista != this.props.delContratista) {
      this._getItems();
    }
  }



  /**
   * Impresión de la lista usa un control de 
   * https://sharepoint.github.io/sp-dev-fx-controls-react/controls/ListView/
   */
  public render(): React.ReactElement<IEventosProps> {
    const { loading, error, eventos } = this.state;

    return (
      <div className={styles.eventos}>

        <div className={styles.cabecera}>
          <div>Eventos de {this.props.delContratista}</div>
        </div>
        <Regiones delContratista={this.props.delContratista} onSelected={this._onRegionSelected} />

        {loading &&
          <Spinner size={SpinnerSize.large} label='Cargando Eventos...' />}
        {!loading &&
          error &&
          <div className={styles.error}>El siguiente error se produjo mientras se intentaba cargar las Eventos: <span className={styles.msg}>{error}</span></div>}
        {!loading &&
          !error &&
          Eventos.length === 0 &&
          <div className={styles.info}>Sin Eventos</div>}
        {!loading &&
          Eventos.length > 0 &&
          <ListView
            items={eventos}
            viewFields={[
              {
                name: 'Title',
                displayName: 'Evento',
                sorting: true,
                minWidth: 170,
                isResizable: true
              },
              {
                name: 'TipoEvento',
                displayName: 'Tipo de Evento',
                sorting: true,
                minWidth: 130,
                maxWidth: 130
              },
              {
                name: 'DisplayFecha',
                displayName: 'Fecha',
                sorting: true,
                minWidth: 100,
                maxWidth: 100,
              }
            ]}
            compact={false}
            selectionMode={SelectionMode.single}
            selection={this._getSelection}
          />}
      </div>
    );
  }

  /**
   * Cuando selecciono una region para filtrar
   */
  private _onRegionSelected = (opcion: IComboBoxOption): void => {
    this.setState({
      region: opcion.text
    }, () => {
      this._getItems();
    });
  }

  /**
   * Cuando seleccione un item, elevo el objeto como propiedad
   */
  private _getSelection = (evento: IEvento[]): void => {
    this.props.onSelected(evento[0]);
  }

}