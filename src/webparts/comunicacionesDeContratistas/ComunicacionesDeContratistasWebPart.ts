import * as React from 'react';
import * as ReactDom from 'react-dom';
import { Version } from '@microsoft/sp-core-library';
import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';
import {
  IPropertyPaneConfiguration,
  PropertyPaneTextField
} from '@microsoft/sp-property-pane';

import * as strings from 'ComunicacionesDeContratistasWebPartStrings';
import ComunicacionesDeContratistas from './components/ComunicacionesDeContratistas';
import { sp } from '@pnp/sp';
import { IgccProps } from './components/IgccProps';


export interface IComunicacionesDeContratistasWebPartProps {
  description: string;
}

export default class ComunicacionesDeContratistasWebPart extends BaseClientSideWebPart<IgccProps> {

  protected onInit(): Promise<void> {
    // setup PnPjs context
    sp.setup({
      spfxContext: this.context
    });

    return Promise.resolve();
  }

  public render(): void {
    const element: React.ReactElement<IgccProps> = React.createElement(
      ComunicacionesDeContratistas,
      {
        description: this.properties.description,
        contexto: this.context
      }
    );

    ReactDom.render(element, this.domElement);
  }

  protected onDispose(): void {
    ReactDom.unmountComponentAtNode(this.domElement);
  }

  protected get dataVersion(): Version {
    return Version.parse('1.0');
  }

  protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration {
    return {
      pages: [
        {
          header: {
            description: strings.PropertyPaneDescription
          },
          groups: [
            {
              groupName: strings.BasicGroupName,
              groupFields: [
                PropertyPaneTextField('description', {
                  label: strings.DescriptionFieldLabel
                })
              ]
            }
          ]
        }
      ]
    };
  }

}
