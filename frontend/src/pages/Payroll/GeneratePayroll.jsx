import { useState, useEffect } from 'react';
import { Form, Card, Button, Alert, Spinner, Table } from 'react-bootstrap';

const GeneratePayroll = () => {
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
    const [loadingFetch, setLoadingFetch] = useState(false);
    const apiURL = import.meta.env.VITE_API_URL;

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value === '' ? '' : Number(value)
        }));
    };

    const handlePayrollChange = (e) => {
        const { name, value } = e.target;
        setPayrollData(prev => ({
            ...prev,
            [name]: value === '' ? '' : Number(value)
        }));
    };

    // Auto calculate net salary on payrollData change
    useEffect(() => {
        if (payrollData) {
            const { basic_salary = 0, bonus = 0, deduction = 0, overtime = 0 } = payrollData;
            const net_salary = (basic_salary + bonus + overtime) - deduction;
            if (payrollData.net_salary !== net_salary) {
                setPayrollData(prev => ({
                    ...prev,
                    net_salary
                }));
            }
        }
    }, [payrollData?.basic_salary, payrollData?.bonus, payrollData?.deduction, payrollData?.overtime]);

    // Fetch payroll data before generating
    const handleFetchPayrollData = async () => {
        setError(null);
        setLoadingFetch(true);
        setPayrollData(null);
        setReportData(null);

        try {
            if (!formData.employee_id) {
                throw new Error('Employee ID is required');
            }

            const response = await fetch(`${apiURL}backend/api/payroll/fetch_employee_payroll.php`, {
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

            setPayrollData({
                employee_id: formData.employee_id,
                employee_name: data.employee_name,
                basic_salary: data.details.basic_salary,
                bonus: data.details.bonus,
                deduction: data.details.deduction,
                overtime: data.details.overtime,
                net_salary: data.net_salary
            });
        } catch (err) {
            setError(err.message || 'An error occurred while fetching payroll data');
        } finally {
            setLoadingFetch(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setLoading(true);
        setReportData(null);

        try {
            if (!formData.employee_id) {
                throw new Error('Employee ID is required');
            }
            if (!payrollData) {
                throw new Error('Please fetch payroll data before generating');
            }

            const response = await fetch(`${apiURL}backend/api/payroll/generate.php`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({
                    employee_id: formData.employee_id,
                    month: formData.month,
                    year: formData.year,
                    bonus: payrollData.bonus,
                    deduction: payrollData.deduction,
                    overtime: payrollData.overtime
                })
            });

            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(data.message || 'Failed to generate payroll');
            }

            // Update payrollData with returned data (optional)
            setPayrollData(prev => ({
                ...prev,
                net_salary: data.net_salary,
                employee_name: data.employee_name
            }));
        } catch (err) {
            setError(err.message || 'An error occurred while generating payroll');
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
            const response = await fetch(`${apiURL}backend/api/payroll/reports.php`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({
                    id: formData.employee_id,
                })
            });

            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(data.message || 'Failed to fetch report');
            }

            setReportData(Array.isArray(data.data) ? data.data : []);
        } catch (err) {
            setError(err.message || 'An error occurred while fetching report');
        } finally {
            setLoadingReport(false);
        }
    };

    const formatCurrency = (value) => {
        return (value || 0).toLocaleString('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
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
                        type="button"
                        variant="info"
                        className="flex-grow-1"
                        onClick={handleFetchPayrollData}
                        disabled={loading || loadingReport || loadingFetch}
                    >
                        {loadingFetch ? (
                            <>
                                <Spinner animation="border" size="sm" /> Fetching...
                            </>
                        ) : (
                            'Fetch Payroll Data'
                        )}
                    </Button>

                    <Button 
                        type="submit"
                        variant="primary"
                        className="flex-grow-1"
                        disabled={loading || loadingReport || loadingFetch || !payrollData}
                    >
                        {loading ? (
                            <>
                                <Spinner animation="border" size="sm" /> Generating...
                            </>
                        ) : (
                            'Generate Payroll'
                        )}
                    </Button>

                    <Button
                        type="button"
                        variant="secondary"
                        className="flex-grow-1"
                        onClick={handleReportView}
                        disabled={loading || loadingReport || loadingFetch}
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
                                <td>{payrollData.employee_id || 'N/A'}</td>
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
                                <td>
                                    <Form.Control
                                        type="number"
                                        name="basic_salary"
                                        value={payrollData.basic_salary || ''}
                                        disabled 
                                    />
                                </td>
                            </tr>
                            <tr>
                                <td>Bonus</td>
                                <td>
                                    <Form.Control
                                        type="number"
                                        name="bonus"
                                        value={payrollData.bonus || ''}
                                        onChange={handlePayrollChange}
                                    />
                                </td>
                            </tr>
                            <tr>
                                <td>Deductions</td>
                                <td>
                                    <Form.Control
                                        type="number"
                                        name="deduction"
                                        value={payrollData.deduction || ''}
                                        onChange={handlePayrollChange}
                                    />
                                </td>
                            </tr>
                            <tr>
                                <td>Overtime</td>
                                <td>
                                    <Form.Control
                                        type="number"
                                        name="overtime"
                                        value={payrollData.overtime || ''}
                                        onChange={handlePayrollChange}
                                    />
                                </td>
                            </tr>
                            <tr className="table-primary">
                                <td><strong>Net Salary</strong></td>
                                <td><strong>{formatCurrency(payrollData.net_salary)}</strong></td>
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
                                    <th>Employee Name</th>
                                    <th>Basic Salary</th>
                                    <th>Bonus</th>
                                    <th>Deductions</th>
                                    <th>Overtime</th>
                                    <th><strong>Net Salary</strong></th>
                                </tr>
                            </thead>
                            <tbody>
                                {reportData.map((row, index) => (
                                    <tr key={`${row.id || index}-${formData.month}-${formData.year}`}>
                                        <td>{row.employee_name || 'N/A'}</td>
                                        <td>{formatCurrency(row.basic_salary)}</td>
                                        <td>{formatCurrency(row.bonus)}</td>
                                        <td>{formatCurrency(row.deduction)}</td>
                                        <td>{formatCurrency(row.overtime)}</td>
                                        <td><strong>{formatCurrency(row.net_salary)}</strong></td>
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

export default GeneratePayroll;
