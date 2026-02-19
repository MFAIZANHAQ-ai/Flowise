import { useMemo, useState } from 'react'

import {
    Alert,
    Box,
    Chip,
    Grid,
    LinearProgress,
    Paper,
    Stack,
    Tab,
    Tabs,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    Tooltip,
    Typography
} from '@mui/material'

import MainCard from 'ui-component/cards/MainCard'
import { StyledButton } from 'ui-component/button/StyledButton'

import { IconAlertTriangle, IconFileUpload, IconInfoCircle } from '@tabler/icons'

const GROUP_NAME = 'MTN Dubai'
const BANK_LIMIT = 0.4
const CURRENCY_LIMIT = 0.35

const defaultCashRows = [
    { entity: 'Global Sourcing Company', bank: 'Barclays UAE', account: 'GSC001', currency: 'USD', amount: 32500000 },
    { entity: 'Global Trading Company', bank: 'Emirates NBD', account: 'GTC019', currency: 'AED', amount: 18250000 },
    { entity: 'Telecom Sourcing Services', bank: 'Standard Bank of South Africa', account: 'TSS112', currency: 'ZAR', amount: 9750000 },
    { entity: 'Interserve', bank: 'Stanbic Bank Ghana', account: 'INT550', currency: 'GHS', amount: 6400000 },
    { entity: 'IMB', bank: 'ABSA Bank Ghana', account: 'IMB201', currency: 'USD', amount: 8800000 },
    { entity: 'IGL', bank: 'Barclays UAE', account: 'IGL020', currency: 'EUR', amount: 11700000 },
    { entity: 'Netherlands BV', bank: 'Emirates NBD', account: 'NBV220', currency: 'EUR', amount: 11200000 },
    { entity: 'Netherlands Coop', bank: 'Standard Bank of South Africa', account: 'NCP022', currency: 'USD', amount: 9300000 },
    { entity: 'NIC BV', bank: 'Barclays UAE', account: 'NIC908', currency: 'USD', amount: 15400000 }
]

const defaultCounterpartyRows = [
    {
        counterparty: 'Barclays UAE',
        agency: 'S&P',
        rating: 'A-',
        outlook: 'Stable',
        countryRisk: 'Medium',
        exposureAmount: 47900000,
        internalRiskScore: 38,
        riskClassification: 'Medium',
        isDowngrade: false
    },
    {
        counterparty: 'Stanbic Bank Ghana',
        agency: 'Fitch',
        rating: 'BB+',
        outlook: 'Negative',
        countryRisk: 'High',
        exposureAmount: 6400000,
        internalRiskScore: 74,
        riskClassification: 'High',
        isDowngrade: true
    },
    {
        counterparty: 'Standard Bank of South Africa',
        agency: 'Moody\'s',
        rating: 'Baa2',
        outlook: 'Stable',
        countryRisk: 'Medium',
        exposureAmount: 19050000,
        internalRiskScore: 49,
        riskClassification: 'Medium',
        isDowngrade: false
    }
]

const defaultDividendRows = [
    { month: '2026-01', opco: 'Global Sourcing Company', entity: 'Global Sourcing Company', dividends: 2600000, managementFees: 460000 },
    { month: '2026-02', opco: 'Global Trading Company', entity: 'Global Trading Company', dividends: 2400000, managementFees: 425000 },
    { month: '2026-03', opco: 'Interserve', entity: 'Interserve', dividends: 1900000, managementFees: 380000 },
    { month: '2026-04', opco: 'IMB', entity: 'IMB', dividends: 2100000, managementFees: 390000 },
    { month: '2026-05', opco: 'IGL', entity: 'IGL', dividends: 2050000, managementFees: 405000 }
]

const defaultForecastRows = [
    { month: '2026-01', scenario: 'Base', openingCash: 123300000, inflows: 16200000, outflows: 13700000 },
    { month: '2026-02', scenario: 'Base', openingCash: 125800000, inflows: 14800000, outflows: 13950000 },
    { month: '2026-03', scenario: 'Base', openingCash: 126650000, inflows: 17000000, outflows: 15800000 },
    { month: '2026-04', scenario: 'Base', openingCash: 127850000, inflows: 16400000, outflows: 17200000 },
    { month: '2026-05', scenario: 'Base', openingCash: 127050000, inflows: 17600000, outflows: 16100000 }
]

const formatCurrency = (value) =>
    new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        maximumFractionDigits: 0
    }).format(Number(value || 0))

const parseDelimitedFile = (file, requiredColumns, onData, onError) => {
    const reader = new FileReader()
    reader.onload = (event) => {
        try {
            const text = event.target?.result
            const lines = `${text}`.trim().split(/\r?\n/)
            const delimiter = lines[0].includes('\t') ? '\t' : ','
            const headers = lines[0].split(delimiter).map((h) => h.trim())
            const missing = requiredColumns.filter((column) => !headers.includes(column))

            if (missing.length) {
                onError(`Missing required columns: ${missing.join(', ')}`)
                return
            }

            const mappedRows = lines.slice(1).filter(Boolean).map((line) => {
                const values = line.split(delimiter)
                return headers.reduce((acc, header, index) => {
                    acc[header] = values[index]?.trim() ?? ''
                    return acc
                }, {})
            })

            onData(mappedRows)
        } catch (error) {
            onError('Unable to parse uploaded file. Please use CSV or TSV format.')
        }
    }

    reader.readAsText(file)
}

const FileUploadCard = ({ title, requiredColumns, onUpload }) => {
    const [error, setError] = useState('')

    const handleUpload = (event) => {
        const file = event.target.files?.[0]
        if (!file) return

        parseDelimitedFile(
            file,
            requiredColumns,
            (rows) => {
                setError('')
                onUpload(rows)
            },
            (parseError) => {
                setError(parseError)
            }
        )
    }

    return (
        <Paper variant='outlined' sx={{ p: 2, mb: 2 }}>
            <Stack direction='row' alignItems='center' spacing={1} sx={{ mb: 1 }}>
                <IconFileUpload size={18} />
                <Typography variant='h4'>{title}</Typography>
            </Stack>
            <Typography variant='caption' sx={{ display: 'block', mb: 1.5 }}>
                Upload CSV/TSV with columns: {requiredColumns.join(', ')}
            </Typography>
            <StyledButton component='label' variant='outlined' startIcon={<IconFileUpload size={16} />}>
                Upload/Refresh Data
                <input hidden type='file' accept='.csv,.tsv,.txt' onChange={handleUpload} />
            </StyledButton>
            {error && (
                <Alert severity='error' sx={{ mt: 1.5 }}>
                    {error}
                </Alert>
            )}
        </Paper>
    )
}

const TabPanel = ({ value, index, children }) => {
    if (value !== index) return null
    return <Box sx={{ pt: 2 }}>{children}</Box>
}

const TreasuryDashboard = () => {
    const [tab, setTab] = useState(0)
    const [cashRows, setCashRows] = useState(defaultCashRows)
    const [counterpartyRows, setCounterpartyRows] = useState(defaultCounterpartyRows)
    const [dividendRows, setDividendRows] = useState(defaultDividendRows)
    const [forecastRows, setForecastRows] = useState(defaultForecastRows)

    const totalCash = useMemo(() => cashRows.reduce((sum, row) => sum + Number(row.amount || 0), 0), [cashRows])

    const entitySummary = useMemo(() => {
        const summary = {}
        cashRows.forEach((row) => {
            summary[row.entity] = (summary[row.entity] || 0) + Number(row.amount || 0)
        })
        return Object.entries(summary)
            .map(([entity, amount]) => ({ entity, amount, share: amount / (totalCash || 1) }))
            .sort((a, b) => b.amount - a.amount)
    }, [cashRows, totalCash])

    const currencySummary = useMemo(() => {
        const summary = {}
        cashRows.forEach((row) => {
            summary[row.currency] = (summary[row.currency] || 0) + Number(row.amount || 0)
        })
        return Object.entries(summary).map(([currency, amount]) => ({ currency, amount, share: amount / (totalCash || 1) }))
    }, [cashRows, totalCash])

    const bankSummary = useMemo(() => {
        const summary = {}
        cashRows.forEach((row) => {
            summary[row.bank] = (summary[row.bank] || 0) + Number(row.amount || 0)
        })
        return Object.entries(summary)
            .map(([bank, amount]) => ({ bank, amount, share: amount / (totalCash || 1), concentrationRisk: amount / (totalCash || 1) > BANK_LIMIT }))
            .sort((a, b) => b.amount - a.amount)
    }, [cashRows, totalCash])

    const forecastSummary = useMemo(
        () =>
            forecastRows.map((row) => {
                const inflows = Number(row.inflows || 0)
                const outflows = Number(row.outflows || 0)
                const opening = Number(row.openingCash || 0)
                return {
                    ...row,
                    inflows,
                    outflows,
                    opening,
                    netMovement: inflows - outflows,
                    closingCash: opening + inflows - outflows
                }
            }),
        [forecastRows]
    )

    return (
        <MainCard>
            <Stack direction='row' alignItems='center' justifyContent='space-between' sx={{ mb: 1 }}>
                <Box>
                    <Typography variant='h2'>Board Treasury Dashboard</Typography>
                    <Typography variant='body2'>{GROUP_NAME} Holding Treasury Analytics Suite</Typography>
                </Box>
                <Tooltip title='All tabs support CSV/TSV upload for monthly refresh. Metrics update automatically.'>
                    <Chip icon={<IconInfoCircle size={16} />} label='Dynamic & Refreshable' color='primary' />
                </Tooltip>
            </Stack>

            <Alert severity='info' sx={{ mb: 1.5 }}>
                Assumptions: Consolidated view shown in USD equivalent, concentration limits configurable (Bank: 40%, Currency: 35%).
            </Alert>

            <Tabs value={tab} onChange={(event, value) => setTab(value)} variant='scrollable' scrollButtons='auto'>
                <Tab label='1. Cash Position' />
                <Tab label='2. Currency Exposure' />
                <Tab label='3. Bank Exposure' />
                <Tab label='4. Counterparty Risk' />
                <Tab label='5. Dividends & Fees' />
                <Tab label='6. 12M Forecast' />
            </Tabs>

            <TabPanel value={tab} index={0}>
                <FileUploadCard
                    title='Cash Position Data Upload'
                    requiredColumns={['entity', 'bank', 'account', 'currency', 'amount']}
                    onUpload={(rows) => setCashRows(rows.map((r) => ({ ...r, amount: Number(r.amount || 0) })))}
                />
                <Grid container spacing={2}>
                    <Grid item xs={12} md={4}>
                        <Paper variant='outlined' sx={{ p: 2 }}>
                            <Typography variant='subtitle2'>Total Cash ({GROUP_NAME})</Typography>
                            <Typography variant='h2'>{formatCurrency(totalCash)}</Typography>
                        </Paper>
                    </Grid>
                    <Grid item xs={12}>
                        <Paper variant='outlined' sx={{ p: 2 }}>
                            <Typography variant='h4' sx={{ mb: 1 }}>Cash by Entity (Holding → Entity)</Typography>
                            <Table size='small'>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Entity</TableCell>
                                        <TableCell align='right'>Total Cash</TableCell>
                                        <TableCell align='right'>% of Group</TableCell>
                                        <TableCell>Visual</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {entitySummary.map((row) => (
                                        <TableRow key={row.entity}>
                                            <TableCell>{row.entity}</TableCell>
                                            <TableCell align='right'>{formatCurrency(row.amount)}</TableCell>
                                            <TableCell align='right'>{(row.share * 100).toFixed(1)}%</TableCell>
                                            <TableCell><LinearProgress variant='determinate' value={Math.min(100, row.share * 100)} /></TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </Paper>
                    </Grid>
                </Grid>
            </TabPanel>

            <TabPanel value={tab} index={1}>
                <Paper variant='outlined' sx={{ p: 2 }}>
                    <Typography variant='h4' sx={{ mb: 1 }}>Currency Exposure & Concentration</Typography>
                    <Table size='small'>
                        <TableHead>
                            <TableRow>
                                <TableCell>Currency</TableCell>
                                <TableCell align='right'>Exposure</TableCell>
                                <TableCell align='right'>% of Group Cash</TableCell>
                                <TableCell>Risk Flag</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {currencySummary.map((row) => (
                                <TableRow key={row.currency}>
                                    <TableCell>{row.currency}</TableCell>
                                    <TableCell align='right'>{formatCurrency(row.amount)}</TableCell>
                                    <TableCell align='right'>{(row.share * 100).toFixed(1)}%</TableCell>
                                    <TableCell>
                                        {row.share > CURRENCY_LIMIT ? (
                                            <Chip color='error' icon={<IconAlertTriangle size={14} />} label='Concentration Risk' size='small' />
                                        ) : (
                                            <Chip color='success' label='Diversified' size='small' />
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </Paper>
            </TabPanel>

            <TabPanel value={tab} index={2}>
                <Paper variant='outlined' sx={{ p: 2 }}>
                    <Typography variant='h4' sx={{ mb: 1 }}>Bank Counterparty Exposure (Bank → Entity → Account → Currency)</Typography>
                    <Table size='small'>
                        <TableHead>
                            <TableRow>
                                <TableCell>Bank</TableCell>
                                <TableCell align='right'>Total Cash</TableCell>
                                <TableCell align='right'>% Group Cash</TableCell>
                                <TableCell>Risk</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {bankSummary.map((row) => (
                                <TableRow key={row.bank} sx={row.concentrationRisk ? { backgroundColor: '#ffe5e5' } : {}}>
                                    <TableCell>{row.bank}</TableCell>
                                    <TableCell align='right'>{formatCurrency(row.amount)}</TableCell>
                                    <TableCell align='right'>{(row.share * 100).toFixed(1)}%</TableCell>
                                    <TableCell>
                                        {row.concentrationRisk ? <Chip color='error' size='small' label='Concentration Risk' /> : <Chip color='success' size='small' label='Within Limit' />}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </Paper>
            </TabPanel>

            <TabPanel value={tab} index={3}>
                <FileUploadCard
                    title='Counterparty Risk Upload'
                    requiredColumns={[
                        'counterparty',
                        'agency',
                        'rating',
                        'outlook',
                        'countryRisk',
                        'exposureAmount',
                        'internalRiskScore',
                        'riskClassification',
                        'isDowngrade'
                    ]}
                    onUpload={(rows) =>
                        setCounterpartyRows(
                            rows.map((row) => ({
                                ...row,
                                exposureAmount: Number(row.exposureAmount || 0),
                                internalRiskScore: Number(row.internalRiskScore || 0),
                                isDowngrade: `${row.isDowngrade}`.toLowerCase() === 'true'
                            }))
                        )
                    }
                />
                <Paper variant='outlined' sx={{ p: 2 }}>
                    <Typography variant='h4' sx={{ mb: 1 }}>Counterparty Risk Assessment</Typography>
                    <Table size='small'>
                        <TableHead>
                            <TableRow>
                                <TableCell>Counterparty</TableCell>
                                <TableCell>Rating / Outlook</TableCell>
                                <TableCell>Country Risk</TableCell>
                                <TableCell align='right'>Exposure</TableCell>
                                <TableCell align='right'>Internal Score</TableCell>
                                <TableCell>Flags</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {counterpartyRows.map((row) => (
                                <TableRow key={row.counterparty}>
                                    <TableCell>{row.counterparty}</TableCell>
                                    <TableCell>{row.agency} {row.rating} / {row.outlook}</TableCell>
                                    <TableCell>{row.countryRisk}</TableCell>
                                    <TableCell align='right'>{formatCurrency(row.exposureAmount)}</TableCell>
                                    <TableCell align='right'>{row.internalRiskScore}</TableCell>
                                    <TableCell>
                                        <Stack direction='row' spacing={1}>
                                            {row.isDowngrade && <Chip size='small' color='warning' label='Downgrade' />}
                                            {row.riskClassification === 'High' && <Chip size='small' color='error' label='High Risk' />}
                                        </Stack>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </Paper>
            </TabPanel>

            <TabPanel value={tab} index={4}>
                <FileUploadCard
                    title='Dividends & Management Fees Upload'
                    requiredColumns={['month', 'opco', 'entity', 'dividends', 'managementFees']}
                    onUpload={(rows) =>
                        setDividendRows(rows.map((row) => ({ ...row, dividends: Number(row.dividends || 0), managementFees: Number(row.managementFees || 0) })))
                    }
                />
                <Paper variant='outlined' sx={{ p: 2 }}>
                    <Typography variant='h4' sx={{ mb: 1 }}>Upstream Receipts by Opco (Monthly / YTD)</Typography>
                    <Table size='small'>
                        <TableHead>
                            <TableRow>
                                <TableCell>Month</TableCell>
                                <TableCell>Opco</TableCell>
                                <TableCell align='right'>Dividends</TableCell>
                                <TableCell align='right'>Management Fees</TableCell>
                                <TableCell align='right'>Total Received</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {dividendRows.map((row, index) => (
                                <TableRow key={`${row.month}-${index}`}>
                                    <TableCell>{row.month}</TableCell>
                                    <TableCell>{row.opco}</TableCell>
                                    <TableCell align='right'>{formatCurrency(row.dividends)}</TableCell>
                                    <TableCell align='right'>{formatCurrency(row.managementFees)}</TableCell>
                                    <TableCell align='right'>{formatCurrency(Number(row.dividends) + Number(row.managementFees))}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </Paper>
            </TabPanel>

            <TabPanel value={tab} index={5}>
                <FileUploadCard
                    title='12-Month Forecast Upload'
                    requiredColumns={['month', 'scenario', 'openingCash', 'inflows', 'outflows']}
                    onUpload={(rows) =>
                        setForecastRows(
                            rows.map((row) => ({
                                ...row,
                                openingCash: Number(row.openingCash || 0),
                                inflows: Number(row.inflows || 0),
                                outflows: Number(row.outflows || 0)
                            }))
                        )
                    }
                />
                <Paper variant='outlined' sx={{ p: 2 }}>
                    <Typography variant='h4' sx={{ mb: 1 }}>12-Month Rolling Liquidity Forecast</Typography>
                    <Table size='small'>
                        <TableHead>
                            <TableRow>
                                <TableCell>Month</TableCell>
                                <TableCell>Scenario</TableCell>
                                <TableCell align='right'>Opening</TableCell>
                                <TableCell align='right'>Inflows</TableCell>
                                <TableCell align='right'>Outflows</TableCell>
                                <TableCell align='right'>Net Movement</TableCell>
                                <TableCell align='right'>Closing</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {forecastSummary.map((row, index) => (
                                <TableRow key={`${row.month}-${index}`}>
                                    <TableCell>{row.month}</TableCell>
                                    <TableCell>{row.scenario}</TableCell>
                                    <TableCell align='right'>{formatCurrency(row.opening)}</TableCell>
                                    <TableCell align='right'>{formatCurrency(row.inflows)}</TableCell>
                                    <TableCell align='right'>{formatCurrency(row.outflows)}</TableCell>
                                    <TableCell align='right' sx={{ color: row.netMovement < 0 ? 'error.main' : 'success.main' }}>
                                        {formatCurrency(row.netMovement)}
                                    </TableCell>
                                    <TableCell align='right'>{formatCurrency(row.closingCash)}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </Paper>
            </TabPanel>
        </MainCard>
    )
}

export default TreasuryDashboard
