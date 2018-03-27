import PropTypes from 'prop-types';
import React from 'react';
import { render } from 'react-dom';

import * as Schema from '../src/Schema';
import { ObjectEditor, ArrayEditor } from '../src/Editor';
import { PropTypes as Props } from '../src/constants'

import update from 'react-addons-update';
import _ from 'lodash';

import './main.css'

const empty = () => null;

const APP_ROOT = document.getElementById('root')

// A deeply nested test schema
const schema = {
    foo: Schema.SchemaTypes.string({ required: true }),

    bar: Schema.SchemaTypes.number(),

    baz: {
        biz: Schema.SchemaTypes.number(),
        boz: Schema.SchemaTypes.number(),

        booz: {
            barz: {
                nested: Schema.SchemaTypes.number(),
            }
        }
    },

    stringArray: Schema.SchemaTypes.arrayOf(Schema.SchemaTypes.string())(),

    complexArray: Schema.SchemaTypes.arrayOf(
        Schema.SchemaTypes.arrayOf({
            foo: Schema.SchemaTypes.string(),
        })()
    )(),
};

// Sets the element at idx to updated
function updateArray (updated, idx) {
    this.setState({
        object: update(
            this.state.object,
            {
                [idx]: {
                    $set: updated
                }
            }
        )
    })
}

// A test wrapper around Editor that keeps track of state
class Wrapper extends React.Component {
    static displayName = 'Wrapper';

    static propTypes = {
      // Initial object to edit
      initialObject: PropTypes.any.isRequired,

      // Schema to use
      type: Props.Schema.isRequired,

      // [optional] handler to use when the object is updated
      onUpdate: PropTypes.func,
    };

    constructor (props) {
        super(props);

        // Initialize state to empty object
        this.state = {
            object: props.initialObject
        };

        // If update handler was specified in props, use that -- otherwise,
        // use the function updateArray
        this.change = (this.props.onUpdate && this.props.onUpdate.bind(this)) ||
                updateArray.bind(this);
    }


    // Handler called when a new object is added.
    // Just adds the object to the end of the array.
    add (newObject) {
        this.setState({ object: [ ...this.state.object, newObject ]});
        return true;
    };

    // Handler called when an element is removed.
    remove (removedObject, removedIndex) {
        this.setState({
            object: _.reject(
                this.state.object,
                (__, idx) => idx === removedIndex
            )
        });
    };

    render () {
        // Choose between object and array components based on whether
        // the object in state is an array.
        const EditorComponent = Array.isArray(this.state.object)
            ? ArrayEditor
            : ObjectEditor;

        return (
        <div>
            <EditorComponent
                className='editor--outside'
                object={this.state.object}
                type={this.props.type}
                onUpdateElement={this.change.bind(this)}
                onAddElement={this.add.bind(this)}
                onRemoveElement={this.remove.bind(this)} />

            <p>
                { JSON.stringify(this.state.object, null, '\t')}
            </p>
        </div>
        );
    }
}

const b = <Wrapper
    initialObject={[
        {
            foo: 'something',
            bar: 4,
            baz: {
                biz: 3,
                booz: {
                    barz: {
                        nested: 2
                    }
                }
            }
        },

        {
            foo: 'baz baz',
        },

        {
            foo: 'baz baz',
        },
    ]}
    type={schema} />;

render(
    b,
    APP_ROOT.appendChild(document.createElement('div'))
);

const c = <Wrapper
    initialObject={{
        foo: 'something',
        bar: 4,
        baz: {
            biz: 3,
            booz: {
                barz: {
                    nested: 2
                }
            }
        }
    }}
    type={schema}
    onUpdate={function (updated) { this.setState({ object: updated }) }}
/>;

render(
    c,
    APP_ROOT.appendChild(document.createElement('div'))
);
