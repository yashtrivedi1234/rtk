import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { DEPARTMENTS, EMPLOYEE_STATUSES } from "../../../utils/constants";
import {
  EMPTY_EMPLOYEE_FORM,
  employeeToFormValues,
  formValuesToPayload,
} from "../employeeUtils";

const schema = yup.object({
  name: yup.string().trim().required("Name is required").min(2, "Name is too short"),
  email: yup.string().trim().email("Enter a valid email").required("Email is required"),
  phone: yup.string().trim().required("Phone is required"),
  department: yup.string().required("Department is required"),
  designation: yup.string().trim().required("Designation is required"),
  salary: yup
    .number()
    .transform((value, originalValue) =>
      originalValue === "" || originalValue == null ? undefined : value,
    )
    .typeError("Salary must be a number")
    .positive("Salary must be greater than 0")
    .required("Salary is required"),
  joiningDate: yup.string().required("Joining date is required"),
  status: yup.string().required("Status is required"),
});

/**
 * Shared create/edit form. Parent owns submit side-effects (mutations + toasts).
 */
export default function EmployeeForm({
  employee = null,
  onSubmit,
  onCancel,
  isSubmitting = false,
  submitLabel,
  errorMessage = null,
}) {
  const isEdit = Boolean(employee?.id);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: EMPTY_EMPLOYEE_FORM,
  });

  useEffect(() => {
    reset(employeeToFormValues(employee));
  }, [employee, reset]);

  const handleFormSubmit = (values) => {
    onSubmit(formValuesToPayload(values));
  };

  return (
    <form className="employee-form" onSubmit={handleSubmit(handleFormSubmit)} noValidate>
      {errorMessage && (
        <p className="alert alert-error" role="alert">
          {errorMessage}
        </p>
      )}

      <div className="form-grid">
        <label className="form-field">
          <span>Name</span>
          <input type="text" autoComplete="name" disabled={isSubmitting} {...register("name")} />
          {errors.name && <em className="field-error">{errors.name.message}</em>}
        </label>

        <label className="form-field">
          <span>Email</span>
          <input type="email" autoComplete="email" disabled={isSubmitting} {...register("email")} />
          {errors.email && <em className="field-error">{errors.email.message}</em>}
        </label>

        <label className="form-field">
          <span>Phone</span>
          <input type="tel" autoComplete="tel" disabled={isSubmitting} {...register("phone")} />
          {errors.phone && <em className="field-error">{errors.phone.message}</em>}
        </label>

        <label className="form-field">
          <span>Department</span>
          <select disabled={isSubmitting} {...register("department")}>
            {DEPARTMENTS.map((dept) => (
              <option key={dept} value={dept}>
                {dept}
              </option>
            ))}
          </select>
          {errors.department && <em className="field-error">{errors.department.message}</em>}
        </label>

        <label className="form-field">
          <span>Designation</span>
          <input type="text" disabled={isSubmitting} {...register("designation")} />
          {errors.designation && (
            <em className="field-error">{errors.designation.message}</em>
          )}
        </label>

        <label className="form-field">
          <span>Salary</span>
          <input type="number" min="0" step="1" disabled={isSubmitting} {...register("salary")} />
          {errors.salary && <em className="field-error">{errors.salary.message}</em>}
        </label>

        <label className="form-field">
          <span>Joining Date</span>
          <input type="date" disabled={isSubmitting} {...register("joiningDate")} />
          {errors.joiningDate && (
            <em className="field-error">{errors.joiningDate.message}</em>
          )}
        </label>

        <label className="form-field">
          <span>Status</span>
          <select disabled={isSubmitting} {...register("status")}>
            {EMPLOYEE_STATUSES.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
          {errors.status && <em className="field-error">{errors.status.message}</em>}
        </label>
      </div>

      <div className="form-actions">
        {onCancel && (
          <button type="button" className="btn btn-ghost" onClick={onCancel} disabled={isSubmitting}>
            Cancel
          </button>
        )}
        <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
          {isSubmitting
            ? "Saving…"
            : (submitLabel ?? (isEdit ? "Save Changes" : "Create Employee"))}
        </button>
      </div>
    </form>
  );
}
