import * as React from 'react';
import { sp } from "@pnp/sp";

import { ComboBox, IComboBoxOption, SelectableOptionMenuItemType } from 'office-ui-fabric-react/lib/index';
import { IEvento } from './IEvento';

/**
 * Propiedades de Regiones
 */
interface IRegionesProps {

  /**
   * Filtra las comunicaciones por este evento
   */
  delContratista: string;

  /**
   * Devuelve el filtro seleccionado
   */
  onSelected?: (option: IComboBoxOption) => void;

}

/**
 * Estado de Regiones
 */
interface IRegionesState {

  /**
   * Items de Regiones
   */
  regiones: IComboBoxOption[];

}


/**
 * Regiones
 */
export default class Regiones extends React.Component<IRegionesProps, IRegionesState> {
  constructor(props: IRegionesProps) {
    super(props);
    this.state = {
      regiones: []
    };
  }

  /**
   * Obtiene las regiones y genera las opciones del combobox
   * Obtener la ayuda del siguiente vinculo
   * https://developer.microsoft.com/en-us/fabric#/controls/web/combobox
   * 
   * para generar la matriz del tipo IComboBoxOption[]
   */
  private _getItems() {
    sp.web.lists
      .getByTitle("Eventos").items
      .select("Region", "Subregion")
      .filter("ContratistaNombre eq '" + this.props.delContratista + "'")
      .orderBy("Region", true).orderBy("Subregion", true)
      .get()
      .then((items: IEvento[]): void => {

        let region: string;
        let subregion: string;
        let opciones: IComboBoxOption[] = [];

        // Generación de matriz IComboBoxOption[]
        items.map(i => {

          if (i.Region != region) {
            let op: IComboBoxOption = {
              key: 'Header1',
              text: i.Region,
              itemType: SelectableOptionMenuItemType.Header
            };
            if (region) {
              opciones.push({ key: 'divider', text: '-', itemType: SelectableOptionMenuItemType.Divider });
            }
            region = i.Region;
            opciones.push(op);
          }

          if (i.Subregion != subregion) {
            let op: IComboBoxOption = {
              key: i.Subregion,
              text: i.Subregion
            };
            subregion = i.Subregion;
            opciones.push(op);
          }

        });

        this.setState({
          regiones: opciones
        });

      });

  }

  /**
   * Al montarse el componente y al cambiar las propiedades poluciono las regiones
   */
  public componentDidMount(): void {
    this._getItems();
  }
  public componentDidUpdate(prevProps: IRegionesProps, prevState: IRegionesState) {
    if (prevProps.delContratista != this.props.delContratista) {
      this._getItems();
    }
  }

  /**
   * Imprimo combo de regiones y subregiones
   */
  public render(): React.ReactElement<IRegionesProps> {
    return (
      <div>
        {this.state.regiones.length > 2 &&
          <ComboBox options={this.state.regiones} onChange={(event, option, index, value) => this.props.onSelected(option)} />}
      </div>
    );
  }
}