/**
 * The questionnaire's step definitions, in order.
 *
 * Structure-as-code (same split as the glossary): this file holds the shape and
 * order of the survey; the visible text lives in messages/<locale>.json under
 * the keys referenced here. Reordering or toggling a step is a one-line change
 * here, no component edits.
 *
 * Mirrors the legacy getSteps(): same nine steps, same order, with staff_salary
 * shown only when there is at least one full-time employee.
 */

import type { Step } from './types';


const steps: Step[] = [
    {
        id: 'activity',
        type: 'activity_ac',
        titleKey: 'questionnaire.steps.activity.title',
        hintKey: 'questionnaire.steps.activity.hint',
    },
    {
        id: 'founders_count',
        type: 'radio',
        titleKey: 'questionnaire.steps.founders.title',
        hintKey: 'questionnaire.steps.founders.hint',
        options: [
            { value: '1', labelKey: 'questionnaire.steps.founders.options.one' },
            { value: '2', labelKey: 'questionnaire.steps.founders.options.two' },
            { value: '3', labelKey: 'questionnaire.steps.founders.options.threePlus' },
        ],
    },
    {
        id: 'liability_preference',
        type: 'radio',
        titleKey: 'questionnaire.steps.liability.title',
        hintKey: 'questionnaire.steps.liability.hint',
        options: [
            { value: 'yes', labelKey: 'questionnaire.steps.liability.options.yes' },
            { value: 'maybe', labelKey: 'questionnaire.steps.liability.options.maybe' },
            { value: 'no', labelKey: 'questionnaire.steps.liability.options.no' },
        ],
    },
    {
        id: 'city',
        type: 'city_ac',
        titleKey: 'questionnaire.steps.city.title',
        hintKey: 'questionnaire.steps.city.hint',
    },
    {
        id: 'revenue',
        type: 'number',
        titleKey: 'questionnaire.steps.revenue.title',
        hintKey: 'questionnaire.steps.revenue.hint',
        dataKey: 'revenue_y1',
        placeholderKey: 'questionnaire.steps.revenue.placeholder',
    },
    {
        id: 'expenses',
        type: 'number',
        titleKey: 'questionnaire.steps.expenses.title',
        hintKey: 'questionnaire.steps.expenses.hint',
        dataKey: 'expenses_monthly',
        placeholderKey: 'questionnaire.steps.expenses.placeholder',
    },
    {
        id: 'staff',
        type: 'dual',
        titleKey: 'questionnaire.steps.staff.title',
        hintKey: 'questionnaire.steps.staff.hint',
        fields: [
            {
                dataKey: 'staff_fulltime',
                labelKey: 'questionnaire.steps.staff.fields.fulltime.label',
                placeholderKey: 'questionnaire.steps.staff.fields.fulltime.placeholder',
            },
            {
                dataKey: 'staff_minijob',
                labelKey: 'questionnaire.steps.staff.fields.minijob.label',
                placeholderKey: 'questionnaire.steps.staff.fields.minijob.placeholder',
            },
        ],
    },
    {
        id: 'staff_salary',
        type: 'number',
        titleKey: 'questionnaire.steps.staffSalary.title',
        hintKey: 'questionnaire.steps.staffSalary.hint',
        dataKey: 'staff_salary_ft',
        placeholderKey: 'questionnaire.steps.staffSalary.placeholder',
        // Conditional: only ask for a salary when there is full-time staff.
        showWhen: (answers) => (answers.staff_fulltime ?? 0) > 0,
    },
    {
        id: 'extras',
        type: 'check',
        titleKey: 'questionnaire.steps.extras.title',
        hintKey: 'questionnaire.steps.extras.hint',
        options: [
            { value: 'ecommerce', labelKey: 'questionnaire.steps.extras.options.ecommerce' },
            { value: 'eu_clients', labelKey: 'questionnaire.steps.extras.options.euClients' },
            { value: 'non_eu', labelKey: 'questionnaire.steps.extras.options.nonEu' },
            { value: 'personal_data', labelKey: 'questionnaire.steps.extras.options.personalData' },
            { value: 'financial_risk', labelKey: 'questionnaire.steps.extras.options.financialRisk' },
            { value: 'employees_later', labelKey: 'questionnaire.steps.extras.options.employeesLater' },
            { value: 'none', labelKey: 'questionnaire.steps.extras.options.none' },
        ],
    },
];


export { steps };