import React, {Component} from 'react'
import {Redirect, Link} from 'react-router-dom'
import {connect} from 'react-redux'
import axios from 'axios'
import moment from 'moment'

import {actorRequest, loadingRequest} from '../../action/action'
import {Navbar, LayoutUser, AdminNavCourse, DeleteModal, LoadingAnim} from '../index'

class AdminCourseAttendance extends Component {
    constructor(props) {
        super(props)
        this.state = {
            active_menu: 'btn_attendance',
            schedule_id: this.props.match.params.id,
            is_loaded: false,
            page: 1,
            total_page: 1,
            meetings: [],
            is_allow_read: false,
            is_allow_create: false,
            is_allow_update: false,
            is_allow_delete: false,
            modal_active: false,
            modal_id: 0
        }
    }

    componentWillMount() {
        this.getPrivilege()
    }

    componentDidMount() {
        this.handleGetAttendance(1)
    }

    getPrivilege = () => {
        const {
            modules_access: {
                attendances
            }
        } = this.props

        if (!attendances) {
            return
        }

        this.setState({
            is_allow_read: attendances.indexOf('READ') >= 0 ? true : false,
            is_allow_create: attendances.indexOf('CREATE') >= 0 ? true : false,
            is_allow_update: attendances.indexOf('UPDATE') >= 0 ? true : false,
            is_allow_delete: attendances.indexOf('DELETE') >= 0 ? true : false
        })
    }

    handleGetAttendance = (page) => {
        axios.get(`/api/admin/v1/attendance?ttl=10&pg=${page}&schedule_id=${this.state.schedule_id}`, {
            validateStatus: (status) => {
                return status === 200
            }
        }).then((res) => {
            const {data} = res.data
            const meetings = data.meetings.map(value => ({
                id: value.id,
                number: value.number,
                subject: value.subject,
                total_attendant: value.total_attendant,
                date: moment.unix(value.date)
            }))
            this.setState({
                meetings: meetings,
                page: data.page,
                total_page: data.total_page,
                is_loaded: true
            })
        }).catch((err) => {
            console.log(err)
        })
    }

    modalDeleteOn = (id) => {
        this.setState({modal_active: true, modal_id: id})
    }
    
    modalDeleteOff = () => {
        this.setState({modal_active: false})
    }

    handleDelete = () => {
        const {dispatcherLoading, dispatcherRequest} = this.props
        dispatcherLoading(10, false)
        axios.delete(`/api/admin/v1/attendance/${this.state.modal_id}?is_force=true`, {
            validateStatus: (status) => {
                return status === 200
            }
        }).then((res) => {
                dispatcherLoading(100, false)
                dispatcherRequest(true, 200, 'Attendance successfully deleted')
                this.setState({modal_active: false, modal_id: 0})
                this.handleGetAttendance(this.state.page)
        }).catch((err) => {
            dispatcherLoading(10, true)
            dispatcherRequest(true, 401, 'Error connection')
        })
    }
    
    render() {
        const {is_logged_in} = this.props
        const modal_handler = {
            On: this.modalDeleteOn,
            Off: this.modalDeleteOff,
            Action: this.handleDelete
        }
        const {
            page,
            total_page,
            meetings,
            is_allow_read,
            is_allow_create,
            is_allow_update,
            is_allow_delete,
            is_loaded
        } = this.state
        return (is_logged_in
            ? (
                is_allow_read ? (
                    <LayoutUser>
                        <Navbar match={this.props.match} active_navbar={"admin"}/>
                        <div className="_ro _ma3mn">
                            <div className="_cn">
                                <div className="_ro _c5m312 _c5x312 _pd5m3n">
                                    <div className="_c5x312 _c5m312 _he3b _pd3l3b">Mobile Computing</div>
                                    <div className="_c5x312 _c5m312 _pd3n3lr  _pd3l3b">
                                        <div className="_pd3n3lr _ta">
                                            <ul className="_ta5p">
                                                <li>
                                                    <Link to="/"><i className="fa fa-home"></i></Link>
                                                </li>
                                                <li>
                                                    <Link to="/admin">Admin</Link>
                                                </li>
                                                <li>
                                                    <Link to={`/admin/course/${this.state.schedule_id}`}>Mobile Computing</Link>
                                                </li>
                                                <li className="_active">
                                                    <Link to={`/admin/course/${this.state.schedule_id}/attendance`}>Attendance</Link>
                                                </li>
                                            </ul>
                                        </div>
                                    </div>
                                    <AdminNavCourse active_menu={this.state.active_menu}/>
                                    <div className="_c5x312 _c5m310 _pd3l3lr">
                                        <div className="_ca">
                                            <div className="_ca3h">
                                                <div className="_c5m310 _c5x310">Attendance</div>
                                                <div className="_c5m32 _c5x32">
                                                    {
                                                        is_allow_create ? (
                                                            <Link to={`/admin/course/${this.state.schedule_id}/attendance/create`} >
                                                                <i className="fa fa-plus-circle" aria-hidden="true"></i>
                                                            </Link>
                                                        ) : null
                                                    }
                                                </div>
                                            </div>
                                            {
                                                is_loaded ? (
                                                    <table className="_se _se3ada">
                                                        <thead>
                                                            <tr>
                                                                <th>No</th>
                                                                <th>Subject</th>
                                                                <th>Date</th>
                                                                <th>Total Attendant</th>
                                                                <th>Action</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {
                                                                meetings.map((meet, k) => (
                                                                    <tr key={k}>
                                                                        <td>{meet.number}</td>
                                                                        <td>{meet.subject}</td>
                                                                        <td>{meet.date.format('YYYY-MM-DD')}</td>
                                                                        <td>{meet.total_attendant}</td>
                                                                        <td>
                                                                            {
                                                                                is_allow_update ? (
                                                                                    <Link to={`/admin/course/${this.state.schedule_id}/attendance/update/${meet.id}`}><i className="fa fa-pencil-square-o _ic3b __wr" aria-hidden="true"></i></Link>
                                                                                ) : null
                                                                            }
                                                                            {
                                                                                is_allow_delete ? (
                                                                                    <Link to="#" onClick={modal_handler.On.bind(null, meet.id)}><i className="fa fa-trash _ic3 __wr" aria-hidden="true"></i></Link>
                                                                                ) : null
                                                                            }
                                                                        </td>
                                                                    </tr>
                                                                ))
                                                            }
                                                        </tbody>
                                                        <tfoot>
                                                            <tr className="_pg">
                                                                <td>
                                                                    <button
                                                                    disabled={page <= 1 ? true : false}
                                                                    onClick={() => {
                                                                        this.handleGetAttendance(page - 1)
                                                                    }}>&laquo; Prev</button>
                                                                </td>
                                                                <td>
                                                                    <button className="_active">{page} of {total_page}</button>
                                                                </td>
                                                                <td>
                                                                    <button
                                                                    disabled={page >= total_page ? true : false}
                                                                    onClick={() => {
                                                                        this.handleGetAttendance(page + 1)
                                                                    }}>Next &raquo;</button>
                                                                </td>
                                                            </tr>
                                                        </tfoot>
                                                    </table>
                                                ) : (
                                                    <table className="_se3msg">
                                                        <tbody>
                                                                <tr>
                                                                    <td>
                                                                            <LoadingAnim color_left="#333" color_right="#333"/>
                                                                    </td>
                                                                </tr>
                                                        </tbody>
                                                    </table>
                                                )
                                            }
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <DeleteModal handle={modal_handler} is_active={this.state.modal_active} />
                    </LayoutUser>
                ) : <Redirect to="/admin"/>
            ) : <Redirect to="/login"/>
        )
    }
}

const mapStatetoProps = (state) => {
    return {is_logged_in: state.is_logged_in, modules_access: state.modules_access, request_status: state.request_status, error_message: state.error_message}
}
const mapDispatchtoProps = (dispatch) => {
    return {
        dispatcherLoading: (loading_progress, is_loading_error) => dispatch(loadingRequest(loading_progress, is_loading_error)),
        dispatcherRequest: (is_logged_in, request_status, error_message) => dispatch(actorRequest(is_logged_in, request_status, error_message))
    }
}
export default connect(mapStatetoProps, mapDispatchtoProps)(AdminCourseAttendance)