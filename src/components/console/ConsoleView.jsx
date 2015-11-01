import React, {Component} from 'react';
import {connect} from 'react-redux';

import * as actions from '../../actions';

import Console from './Console';
import StdinStatus from './StdinStatus';

class MemoryView extends Component {

    render() {
        return <div className="console-view">
            <h2>Console</h2>
            <Console
                console={this.props.console}
                onEnqueueStdin={this.props.onEnqueueStdin}
            />
            <StdinStatus
                stdin={this.props.console.get("stdin")}
                kbsr={this.props.memory.get(0xFE00)}
                kbdr={this.props.memory.get(0xFE02)}
            />
        </div>;
    }

}

function mapStateToProps(state) {
    return {
        memory: state.get("lc3").memory,
        console: state.get("console"),
    };
}

function mapDispatchToProps(dispatch) {
    return {
        onEnqueueStdin: (text) => dispatch(actions.enqueueStdin(text)),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(MemoryView);
