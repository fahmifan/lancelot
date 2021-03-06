import React from 'react'
import {string, number, func, bool} from 'prop-types'
import {connect} from 'react-redux'

import {loadingRequest} from '../../action/action'

class LoadingBar extends React.Component {

    constructor() {
        super()

        // Initial State
        this.state = {
            // To show
            show: true,

            // binding class when it end
            full: '',

            // state to animate the width of loading bar
            width: 0,

            // indicate the loading bar is in 100% ( so, wait it till gone )
            wait: false,

            // Error State
            myError: false
        }
    }

    // The Props
    static propTypes = {
        id: string,
        className: string,
        progress: number,
        direction: string,
        error: bool,
        onErrorDone: func,
        onProgressDone: func
    }

    static defaultProps = {
        progress: 0,
        direction: 'right',
        onErrorDone: () => {},
        onProgressDone: () => {}
    }

    render() {

        let {direction, className, id} = this.props
        let {show, full, myError} = this.state
        return (
            <div>
                {show
                    ? <div
                            id={id
                            ? id
                            : null}
                            className={'LoadingBar LoadingBar--to_' + direction + ' ' + (className
                            ? className
                            : '') + (myError
                            ? 'LoadingBar--error'
                            : '') + (full
                            ? 'LoadingBar--full'
                            : '')}
                            style={this.styling()}>
                            <div className="LoadingBar-glow"></div>
                        </div>
                    : null}
            </div>
        )
    }

    componentWillReceiveProps(nextProps) {

        // Watching Progress Changes
        if (nextProps.progress !== this.props.progress) {
            this.setState({
                width: nextProps.progress
            }, this.isFull.bind(this))
        }

        // Watching Error
        if (nextProps.error !== this.props.error) {
            if (nextProps.error) 
                this.setState({
                    width: 100,
                    myError: true
                }, this.isFull.bind(this))
        }

    }

    // Check whether the proggress is full
    isFull() {
        // Full Indicator
        let isFull = this.state.width === 100

        // When the progress end or full
        if (isFull) {
            // Prevent new progress change
            this.setState({wait: true})

            // Start animate it
            setTimeout(() => {

                // animate when element removed
                this.setState({full: true, myError: false})

                this
                    .props
                    .dispatcherLoading(0, false)

                setTimeout(() => {
                    this.setState({
                        //remove bar element
                        show: false,
                        // New Element is available to create now
                        width: 0,
                        wait: false
                    })

                    setTimeout(() => {

                        this.setState({
                            // Show Bar
                            full: '',
                            show: true
                        })

                        this
                            .props
                            .dispatcherLoading(0, false)

                    })

                    // Duration to Waiting for slick hiding animation
                }, 250)

                // Duration is depend on css animation-duration of loading-bar
            }, 700)
        }
    }

    styling() {
        // When loading bar still in progress
        if (!this.state.wait) {
            return {width: `${this.state.width}%`}

            // When loading bar end
        } else {
            // Make it stuck at 100 to waiting the animation
            return {width: `100%`}
        }
    }

}

const mapStatetoProps = (state) => {
    return {progress: state.loading_progress, error: state.is_loading_error}
}

const mapDispatchtoProps = (dispatch) => {
    return {
        dispatcherLoading: (progress, error) => dispatch(loadingRequest(progress, error))
    }
}
export default connect(mapStatetoProps, mapDispatchtoProps)(LoadingBar)