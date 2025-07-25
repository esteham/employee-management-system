import { useState } from 'react';
import { Form, Card, Button, Alert, Spinner, Table } from 'react-bootstrap';

const ViewPayroll = () => {
    const [formData, setFormData] = useState({
        employee_id: '',
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear()
    });

    const [payrollData, setPayrollData] = useState(null);
    const [reportData, setReportData] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [loadingReport, setLoadingReport] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value === '' ? '' : Number(value)
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setLoading(true);
        setPayrollData(null);
        setReportData(null);

        try {
            if (!formData.employee_id) {
                throw new Error('Employee ID is required');
            }

            const response = await fetch('http://localhost/IsDB_WDPF_CGNT-M_64/PROJECTs/REACT/employee-management-system/backend/api/payroll/generate.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({
                    employee_id: formData.employee_id,
                    month: formData.month,
                    year: formData.year
                })
            });

            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(data.message || 'Failed to fetch payroll data');
            }

            setPayrollData(data.data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleReportView = async () => {
        setError(null);
        setLoadingReport(true);
        setPayrollData(null);
        setReportData(null);

        try {
            const response = await fetch('http://localhost/IsDB_WDPF_CGNT-M_64/PROJECTs/REACT/employee-management-system/backend/api/payroll/reports.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({
                    month: formData.month,
                    year: formData.year
                })
            });

            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(data.message || 'Failed to fetch report');
            }

            setReportData(data.data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoadingReport(false);
        }
    };

    return (
        <Card className="mt-4 p-4 mx-auto" style={{ maxWidth: '800px' }}>
            <h2 className="text-center mb-4">View Employee Payroll</h2>

            {error && <Alert variant="danger" onClose={() => setError(null)} dismissible>{error}</Alert>}

            <Form onSubmit={handleSubmit}>
                <div className="row g-3">
                    <div className="col-md-6">
                        <Form.Group controlId="employeeId">
                            <Form.Label>Employee ID</Form.Label>
                            <Form.Control
                                type="number"
                                name="employee_id"
                                value={formData.employee_id}
                                onChange={handleChange}
                                min="1"
                                required
                                placeholder="Enter employee ID"
                            />
                        </Form.Group>
                    </div>
                    <div className="col-md-3">
                        <Form.Group controlId="month">
                            <Form.Label>Month</Form.Label>
                            <Form.Control
                                type="number"
                                name="month"
                                value={formData.month}
                                onChange={handleChange}
                                min="1"
                                max="12"
                                required
                            />
                        </Form.Group>
                    </div>
                    <div className="col-md-3">
                        <Form.Group controlId="year">
                            <Form.Label>Year</Form.Label>
                            <Form.Control
                                type="number"
                                name="year"
                                value={formData.year}
                                onChange={handleChange}
                                min="2000"
                                max="2100"
                                required
                            />
                        </Form.Group>
                    </div>
                </div>

                <div className="d-flex gap-2 mt-3">
                    <Button 
                        type="submit"
                        variant="primary"
                        className="flex-grow-1"
                        disabled={loading || loadingReport}
                    >
                        {loading ? (
                            <>
                                <Spinner animation="border" size="sm" /> Generating...
                            </>
                        ) : (
                            'Generate'
                        )}
                    </Button>

                    <Button
                        type="button"
                        variant="secondary"
                        className="flex-grow-1"
                        onClick={handleReportView}
                        disabled={loading || loadingReport}
                    >
                        {loadingReport ? (
                            <>
                                <Spinner animation="border" size="sm" /> Loading...
                            </>
                        ) : (
                            'Monthly Report'
                        )}
                    </Button>
                </div>
            </Form>

            {payrollData && (
                <div className="mt-4">
                    <h4>Payroll Details</h4>
                    <Table striped bordered hover responsive className="mt-3">
                        <tbody>
                            <tr>
                                <td><strong>Employee ID</strong></td>
                                <td>{payrollData.employee_id}</td>
                            </tr>
                            <tr>
                                <td><strong>Employee Name</strong></td>
                                <td>{payrollData.employee_name || 'N/A'}</td>
                            </tr>
                            <tr>
                                <td><strong>Period</strong></td>
                                <td>{new Date(formData.year, formData.month - 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</td>
                            </tr>
                            <tr>
                                <td>Basic Salary</td>
                                <td>${(payrollData.basic_salary || 0).toFixed(2)}</td>
                            </tr>
                            <tr>
                                <td>Bonus</td>
                                <td>${(payrollData.bonus || 0).toFixed(2)}</td>
                            </tr>
                            <tr>
                                <td>Deductions</td>
                                <td>${(payrollData.deduction || 0).toFixed(2)}</td>
                            </tr>
                            <tr>
                                <td>Overtime</td>
                                <td>${(payrollData.overtime || 0).toFixed(2)}</td>
                            </tr>
                            <tr className="table-primary">
                                <td><strong>Net Salary</strong></td>
                                <td><strong>${(payrollData.net_salary || 0).toFixed(2)}</strong></td>
                            </tr>
                        </tbody>
                    </Table>
                </div>
            )}

            {reportData && (
                <div className="mt-5">
                    <div className="d-flex justify-content-between align-items-center mb-3">
                        <h4>Monthly Payroll Report</h4>
                        <div>
                            <strong>Period: </strong>
                            {new Date(formData.year, formData.month - 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                        </div>
                    </div>
                    
                    {reportData.length > 0 ? (
                        <Table striped bordered hover responsive>
                            <thead className="table-dark">
                                <tr>
                                    <th>Employee ID</th>
                                    <th>Name</th>
                                    <th>Basic Salary</th>
                                    <th>Bonus</th>
                                    <th>Deductions</th>
                                    <th>Overtime</th>
                                    <th><strong>Net Salary</strong></th>
                                </tr>
                            </thead>
                            <tbody>
                                {reportData.map((row) => (
                                    <tr key={`${row.employee_id}-${formData.month}-${formData.year}`}>
                                        <td>{row.employee_id}</td>
                                        <td>{row.employee_name || 'N/A'}</td>
                                        <td>${(row.basic_salary || 0).toFixed(2)}</td>
                                        <td>${(row.bonus || 0).toFixed(2)}</td>
                                        <td>${(row.deduction || 0).toFixed(2)}</td>
                                        <td>${(row.overtime || 0).toFixed(2)}</td>
                                        <td><strong>${(row.net_salary || 0).toFixed(2)}</strong></td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    ) : (
                        <Alert variant="info">No payroll data found for the selected period</Alert>
                    )}
                </div>
            )}
        </Card>
    );
};

export default ViewPayroll;