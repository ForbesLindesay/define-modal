import * as React from 'react';

export interface ActiveModal {
  state: ModalState;
  element: JSX.Element;
  onClose: () => void;
}
let nextKey = 0;
const activeModals: ActiveModal[] = [];
const subscriptions: (() => void)[] = [];
function triggerUpdate() {
  subscriptions.forEach(fn => fn());
}

export enum ModalState {
  Opening = 'opening',
  Open = 'open',
  Closing = 'closing',
}
export interface ModalProps<TInput, TResult> {
  input: TInput;
  state: ModalState;
  resolve: (result: PromiseLike<TResult | null> | TResult | null) => void;
  reject: (err: any) => void;
}
export interface Options {
  closeAnimationDuration?: number;
}

export interface ContainerProps {
  children: React.ReactNode;
  state: ModalState;
  onClose: () => void;
}
export interface BackdropProps {
  state: ModalState;
  onClose: () => void;
}
export interface ModalDialogsProps {
  container?: React.ComponentType<ContainerProps>;
  backdrop?: React.ComponentType<BackdropProps>;
}
export interface State {
  activeModals: ActiveModal[];
}
export class ModalDialogs extends React.Component<ModalDialogsProps, State> {
  state: State = {activeModals};
  componentDidMount() {
    subscriptions.push(this._onUpdate);
  }
  componentWillUnmount() {
    const index = subscriptions.indexOf(this._onUpdate);
    if (index !== -1) {
      subscriptions.splice(index, 1);
    }
  }
  _onUpdate = () => {
    this.setState({activeModals: activeModals.slice()});
  };
  _onBackdropClick = () => {
    this.state.activeModals.forEach(m => m.onClose());
  };
  _renderBackdrop() {
    const Component = this.props.backdrop;
    if (this.state.activeModals.length === 0 || !Component) {
      return null;
    }
    if (this.state.activeModals.length === 1) {
      return (
        <Component
          state={this.state.activeModals[0].state}
          onClose={this._onBackdropClick}
        />
      );
    }
    return (
      <Component state={ModalState.Open} onClose={this._onBackdropClick} />
    );
  }
  render() {
    const children = (
      <React.Fragment>
        {this._renderBackdrop()}
        {this.state.activeModals.map(m => m.element)}
      </React.Fragment>
    );
    const Component = this.props.container;
    if (this.state.activeModals.length === 0 || !Component) {
      return children;
    }
    if (this.state.activeModals.length === 1) {
      return (
        <Component
          children={children}
          state={this.state.activeModals[0].state}
          onClose={this._onBackdropClick}
        />
      );
    }
    return (
      <Component
        children={children}
        state={ModalState.Open}
        onClose={this._onBackdropClick}
      />
    );
  }
}

export default function defineModal<TInput, TResult>(
  Component: React.ComponentType<ModalProps<TInput, TResult>>,
  options: Options = {},
): (input: TInput) => Promise<TResult | null> {
  return (input: TInput): Promise<TResult | null> => {
    return new Promise<TResult | null>((resolve, reject) => {
      const key = nextKey++;
      let closing = false;
      const onResolve = (
        result: PromiseLike<TResult | null> | TResult | null,
      ) => {
        close();
        resolve(result);
      };
      const onReject = (err: any) => {
        close();
        reject(err);
      };
      const render = (state: ModalState) => (
        <Component
          key={key}
          input={input}
          state={state}
          resolve={onResolve}
          reject={onReject}
        />
      );
      const close = () => {
        if (closing) return;
        closing = true;
        if (options.closeAnimationDuration) {
          activeModal.state = ModalState.Closing;
          activeModal.element = render(ModalState.Closing);
          triggerUpdate();
          setTimeout(closed, options.closeAnimationDuration);
        } else {
          closed();
        }
      };
      const closed = () => {
        activeModals.splice(activeModals.indexOf(activeModal), 1);
        triggerUpdate();
      };
      const open = () => {
        if (closing) return;
        activeModal.state = ModalState.Open;
        activeModal.element = render(ModalState.Open);
        triggerUpdate();
      };
      const activeModal: ActiveModal = {
        state: ModalState.Opening,
        element: render(ModalState.Opening),
        onClose: () => onResolve(null),
      };
      activeModals.push(activeModal);
      triggerUpdate();
      if (typeof requestAnimationFrame === 'function') {
        requestAnimationFrame(open);
      } else {
        setTimeout(open, 0);
      }
    });
  };
}
