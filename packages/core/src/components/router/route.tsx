import { Component, Event, EventEmitter, Prop } from '@stencil/core';

export interface RouterEntry {
  path?: string;
  component: string;
  props?: any;
}

/**
  * @name Route
  * @module ionic
  * @description
 */
@Component({
  tag: 'ion-route'
})
export class Route implements RouterEntry {

  @Prop() path: string;
  @Prop() component: string;
  @Prop() props: any = {};

  @Event() ionRouteAdded: EventEmitter<RouterEntry>;
  @Event() ionRouteRemoved: EventEmitter<string>;

  protected ionViewDidLoad() {
    this.ionRouteAdded.emit({
      path: this.path,
      component: this.component,
      props: this.props
    });
  }

  protected ionViewDidUnload() {
    this.ionRouteRemoved.emit(this.path);
  }
}
