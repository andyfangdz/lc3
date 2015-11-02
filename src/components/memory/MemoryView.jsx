import React, {Component} from 'react';
import {connect} from 'react-redux';

import * as actions from '../../actions';

import {Panel} from 'react-bootstrap';
import RawModal from './RawModal';
import AssembleModal from './AssembleModal';
import MemoryNav from './MemoryNav';
import MemorySearch from './MemorySearch';
import MemoryTable from './MemoryTable';
import IOToolbar from './IOToolbar';

class MemoryView extends Component {

    constructor() {
        super();
        this.state = {
            showRawModal: false,
            showAssembleModal: false,
        };
    }

    shouldComponentUpdate(newProps, newState) {
        return this.props.lc3.get("memory") !== newProps.lc3.get("memory") ||
            this.props.lc3.get("registers") !== newProps.lc3.get("registers") ||
            this.props.viewOptions !== newProps.viewOptions;
    }

    render() {
        const {lc3, viewOptions} = this.props;

        const header = <MemoryNav
            onScrollToPC={this.props.onScrollToPC}
            onScrollBy={this.props.onScrollBy}
            symbolTable={this.props.lc3.symbolTable}
            onScrollTo={this.props.onScrollTo}
        />;
        const footer = <IOToolbar
            onShowRaw={() => this.setState({ showRawModal: true })}
            onShowAssemble={() => this.setState({ showAssembleModal: true })}
        />;

        return <div className="memory-view">
            <h2>Memory</h2>
            <Panel header={header} footer={footer}>
                <MemoryTable
                    lc3={this.props.lc3}
                    topRow={viewOptions.get("topAddressShown")}
                    onSetPC={this.props.onSetPC}
                    onSetMemory={this.props.onSetMemory}
                    fill
                />
            </Panel>
            <RawModal
                show={this.state.showRawModal}
                onHide={() => this.setState({ showRawModal: false })}
                onLoadIntoLC3={this.handleLoadIntoLC3.bind(this)}
                onDownloadObject={this.handleDownloadObject.bind(this)}
            />
            <AssembleModal
                show={this.state.showAssembleModal}
                onHide={() => this.setState({ showAssembleModal: false })}
                onLoadIntoLC3={this.handleLoadIntoLC3.bind(this)}
                onDownloadObject={this.handleDownloadObject.bind(this)}
            />
        </div>;
    }

    handleLoadIntoLC3(data) {
        this.props.onLoadProgram(data);
        this.setState({
            showRawModal: false,
            showAssembleModal: false,
        });
    }

    handleDownloadObject(data) {
        console.log("Downloading not yet implemented");  // TODO(william)
        this.setState({
            showRawModal: false,
        });
    }

}

function mapStateToProps(state) {
    return {
        lc3: state.get("lc3"),
        viewOptions: state.get("viewOptions"),
    };
}

function mapDispatchToProps(dispatch) {
    return {
        onSetPC: (newPC) => dispatch(actions.setPC(newPC)),
        onLoadProgram: (program) => dispatch(actions.loadProgram(program)),
        onScrollBy: (delta) => dispatch(actions.scrollBy(delta)),
        onScrollToPC: () => dispatch(actions.scrollToPC()),
        onScrollTo: (addr) => dispatch(actions.scrollTo(addr)),
        onSetMemory: (addr, value) => dispatch(actions.setMemory(addr, value)),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(MemoryView);
