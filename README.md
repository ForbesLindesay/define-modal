# Define Modal

A really simple interface for buidling modals in React.

## Usage

### Declare a backdrop (optional)

```ts
import * as React from 'react';
import {ModalState, BackdropProps} from 'define-modal';

function Backdrop(props: BackdropProps) {
  return (
    <div
      style={{
        background: 'black',
        opacity: props.state !== ModalState.Closing ? 0.5 : 0,
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        transition: 'opacity 0.1s',
      }}
      onClick={props.onClose}
    />
  );
}
```

### Render the modals

At the top level of your applicaiton, render the modal:

```ts
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import {ModalDialogs} from 'define-modal';
import Backdrop from './Backdrop';

ReactDOM.render(
  <React.Fragment>
    <App />
    <ModalDialogs backdrop={Backdrop} />
  </React.Fragment>,
  document.getElementById('root'),
);
```

### Define a modal

The modal component is passe dan `input`, a `state` (one of `'opening'`, `'open'` or `'closing'`), and `resolve` & `reject` (which mirror the `resolve` and `reject` funtions passed into the Promise factory).

The result of calling `defineModal` is an asynchronous function that takes a single argument, `input`, and returns whatever gets passed to `resolve` or rejects with the error passed to `reject`.

If you are using typescript, `ModalProps` is generic and lets you specify the type of the input and result. If the dialog is closed by clicking the backdrop, the result will be `null`.

```ts
import * as React from 'react';
import defineModal, {ModalProps} from 'define-modal';
import FocusLock from 'react-focus-lock';

function ConfirmModal(
  props: ModalProps<
    {question: string; trueAnswer?: string; falseAnswer?: string},
    boolean
  >,
) {
  return (
    <FocusLock>
      <dialog open={true}>
        {props.input.question}
        <button>{props.input.trueAnswer || 'yes'}</button>
        <button>{props.input.falseAnswer || 'no'}</button>
      </dialog>
    </FocusLock>
  );
}

export default definModal(ConfirmModal);
```

### Using the modal

```ts
import * as React from 'react';
import confirm from './confirm';

function DeleteButton() {
  return (
    <button
      type="button"
      onClick={async () => {
        if (
          await confirm({
            question: 'Are you sure you want to delete this?',
          })
        ) {
          deleteIt();
        }
      }}
    >
      Delete
    </button>
  );
}
```
