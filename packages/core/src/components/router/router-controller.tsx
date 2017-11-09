import { Component, Listen, Prop } from '@stencil/core';


export interface NavElement extends HTMLElement {
  setSegment(segment: string): Promise<NavState>;
  getState(): NavState;
}

export interface NavState {
  segment: string;
  focusNode: HTMLElement;
}
/**
  * @name RouterController
  * @module ionic
  * @description
 */
@Component({
  tag: 'ion-router-controller'
})
export class RouterController {

  private updateURL = true;

  @Prop() fragment: boolean = true;

  @Listen('window:hashchange')
  hashChanged() {
    if (!this.updateURL) {
      return;
    }
    if (this.fragment) {
      const fragment = window.location.hash.substr(1);
      this.updateApp(fragment);
    }
  }

  @Listen('body:ionNavChanged')
  navChanged(ev: CustomEvent) {
    if (!this.updateURL) {
      return;
    }
    console.log('Updating URL based in NAVS change');
    const detail = ev.detail;
    const isPop = detail.isPop === true;
    const url = this.computeURL();
    if (isPop) {
      window.history.back();
      window.history.replaceState(null, null, url);
    } else {
      window.history.pushState(null, null, url);
    }
    console.log(this.computeURL());
  }

  private computeURL(): string {
    return ('#/' + this.getNavStack()
      .map(s => s.segment)
      .join('/'));
  }

  private updateApp(url: string) {
    console.log('Updating NAVS based in URL change');
    const segments = url.split('/').filter(s => s.length > 0);
    let node = document.querySelector('ion-app') as HTMLElement;
    this.updateURL = false;
    updateApp(node, segments)
      .then(() => console.log('app updated based in URL', url))
      .catch(err => console.error(err))
      .then(() => this.updateURL = true);
  }

  private getNavStack(): NavState[] {
    let node = document.querySelector('ion-app') as HTMLElement;
    let stack = [];
    while (true) {
      const pivot = findNav(node);
      if (pivot) {
        const state = pivot.getState();
        node = state.focusNode;
        stack.push(state);
      } else {
        break;
      }
    }
    return stack;
  }

}

function updateApp(root: HTMLElement, segments: string[]): Promise<void> {
  const pivot = findNav(root);
  if (pivot) {
    const segment = segments.shift();
    return pivot.setSegment(segment)
      .then(s => updateApp(s.focusNode, segments));
  } else {
    return Promise.resolve();
  }
}

const navs = ['ION-NAV', 'ION-TABS'];
function findNav(root: HTMLElement): NavElement {
  if (!root) {
    return null;
  }
  // we do a Breadth-first search
  // Breadth-first search (BFS) is an algorithm for traversing or searching tree
  // or graph data structures.It starts at the tree root(or some arbitrary node of a graph,
  // sometimes referred to as a 'search key'[1]) and explores the neighbor nodes
  // first, before moving to the next level neighbours.

  const queue = [root];
  while (queue.length > 0) {
    const node = queue.shift();
    // visit node
    if (navs.indexOf(node.tagName) >= 0) {
      return node as NavElement;
    }

    // queue children
    const children = node.children;
    for (let i = 0; i < children.length; i++) {
      queue.push(children.item(i) as NavElement);
    }
  }
  return null;
}
