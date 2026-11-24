import { useMemo, useState, type FormEvent } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const wards = [
  "General Ward",
  "ICU",
  "Emergency",
  "Maternity Ward",
  "Children's Ward",
  "Private Room",
];
const departments = [
  "General Medicine",
  "Cardiology",
  "Orthopaedics",
  "Neurology",
  "Paediatrics",
  "Gynaecology",
];
const doctors = [
  "Dr. Anjali Mehta",
  "Dr. Rajesh Kumar",
  "Dr. Priya Nair",
  "Dr. Suresh Iyer",
  "Dr. Kavita Rao",
  "Dr. Farhan Qureshi",
];
const statuses = ["Admitted", "Discharged"] as const;

type PatientStatus = (typeof statuses)[number];
type Gender = "Male" | "Female";
type Patient = {
  id: string;
  name: string;
  age: number;
  gender: Gender;
  ward: string;
  department: string;
  doctor: string;
  admittedOn: string;
  status: PatientStatus;
};
type PatientForm = Omit<Patient, "id" | "age" | "status"> & { age: string };
type PatientFilters = {
  search: string;
  ward: string;
  department: string;
  doctor: string;
  status: string;
};

const initialPatients: Patient[] = [
  {
    id: "patient-1",
    name: "Vikram Singh",
    age: 52,
    gender: "Male",
    ward: "Private Room",
    department: "Orthopaedics",
    doctor: "Dr. Suresh Iyer",
    admittedOn: "2026-11-22",
    status: "Admitted",
  },
  {
    id: "patient-2",
    name: "Sunita Sharma",
    age: 29,
    gender: "Female",
    ward: "Maternity Ward",
    department: "Gynaecology",
    doctor: "Dr. Kavita Rao",
    admittedOn: "2026-11-21",
    status: "Admitted",
  },
  {
    id: "patient-3",
    name: "Arjun Reddy",
    age: 8,
    gender: "Male",
    ward: "Children's Ward",
    department: "Paediatrics",
    doctor: "Dr. Priya Nair",
    admittedOn: "2026-11-20",
    status: "Admitted",
  },
  {
    id: "patient-4",
    name: "Ramesh Gupta",
    age: 64,
    gender: "Male",
    ward: "ICU",
    department: "Cardiology",
    doctor: "Dr. Anjali Mehta",
    admittedOn: "2026-11-18",
    status: "Admitted",
  },
  {
    id: "patient-5",
    name: "Meera Joshi",
    age: 71,
    gender: "Female",
    ward: "General Ward",
    department: "Neurology",
    doctor: "Dr. Farhan Qureshi",
    admittedOn: "2026-11-15",
    status: "Admitted",
  },
  {
    id: "patient-6",
    name: "Fatima Shaikh",
    age: 45,
    gender: "Female",
    ward: "General Ward",
    department: "General Medicine",
    doctor: "Dr. Rajesh Kumar",
    admittedOn: "2026-11-12",
    status: "Discharged",
  },
];

function todayAsIsoDate() {
  return new Date().toISOString().slice(0, 10);
}

function createEmptyForm(): PatientForm {
  return {
    name: "",
    age: "",
    gender: "Female",
    ward: wards[0] ?? "General Ward",
    department: departments[0] ?? "General Medicine",
    doctor: doctors[0] ?? "Dr. Anjali Mehta",
    admittedOn: todayAsIsoDate(),
  };
}

function formatAdmissionDate(date: string) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${date}T00:00:00Z`));
}

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Patient Admissions | Ward Register" },
      {
        name: "description",
        content: "Hospital patient ward register for admissions, doctors, and discharge status.",
      },
      { property: "og:title", content: "Patient Admissions | Ward Register" },
      {
        property: "og:description",
        content: "Hospital patient ward register for admissions, doctors, and discharge status.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Index,
});

function Index() {
  const [patients, setPatients] = useState(initialPatients);
  const [filters, setFilters] = useState<PatientFilters>({
    search: "",
    ward: "",
    department: "",
    doctor: "",
    status: "",
  });
  const [formOpen, setFormOpen] = useState(false);
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);
  const [patientForm, setPatientForm] = useState<PatientForm>(createEmptyForm);
  const [patientToDelete, setPatientToDelete] = useState<Patient | null>(null);

  const visiblePatients = useMemo(() => {
    const search = filters.search.trim().toLowerCase();
    return patients.filter((patient) => {
      const matchesSearch = !search || patient.name.toLowerCase().includes(search);
      return (
        matchesSearch &&
        (!filters.ward || patient.ward === filters.ward) &&
        (!filters.department || patient.department === filters.department) &&
        (!filters.doctor || patient.doctor === filters.doctor) &&
        (!filters.status || patient.status === filters.status)
      );
    });
  }, [filters, patients]);

  const admittedCount = visiblePatients.filter((patient) => patient.status === "Admitted").length;
  const dischargedCount = visiblePatients.filter((patient) => patient.status === "Discharged").length;

  function updateFilters(changes: Partial<PatientFilters>) {
    setFilters((current) => ({ ...current, ...changes }));
  }

  function resetFilters() {
    setFilters({ search: "", ward: "", department: "", doctor: "", status: "" });
  }

  function openAddForm() {
    setEditingPatient(null);
    setPatientForm(createEmptyForm());
    setFormOpen(true);
  }

  function openEditForm(patient: Patient) {
    setEditingPatient(patient);
    setPatientForm({
      name: patient.name,
      age: String(patient.age),
      gender: patient.gender,
      ward: patient.ward,
      department: patient.department,
      doctor: patient.doctor,
      admittedOn: patient.admittedOn,
    });
    setFormOpen(true);
  }

  function updatePatientForm<Key extends keyof PatientForm>(key: Key, value: PatientForm[Key]) {
    setPatientForm((current) => ({ ...current, [key]: value }));
  }

  function savePatient(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const name = patientForm.name.trim();
    const age = Number(patientForm.age);
    if (!name || !Number.isFinite(age) || age < 0) return;

    if (editingPatient) {
      setPatients((current) =>
        current.map((patient) =>
          patient.id === editingPatient.id
            ? { ...patient, ...patientForm, name, age }
            : patient,
        ),
      );
    } else {
      setPatients((current) => [
        {
          id: globalThis.crypto.randomUUID(),
          ...patientForm,
          name,
          age,
          status: "Admitted",
        },
        ...current,
      ]);
    }
    setFormOpen(false);
    setEditingPatient(null);
  }

  function dischargePatient(patientId: string) {
    setPatients((current) =>
      current.map((patient) =>
        patient.id === patientId ? { ...patient, status: "Discharged" } : patient,
      ),
    );
  }

  function deletePatient() {
    if (!patientToDelete) return;
    setPatients((current) => current.filter((patient) => patient.id !== patientToDelete.id));
    setPatientToDelete(null);
  }

  return (
    <div className="min-h-screen bg-admissions-canvas text-admissions-ink">
      <header className="border-b border-admissions-border bg-admissions-surface">
        <div className="mx-auto flex min-h-[76px] max-w-[1208px] items-center justify-between gap-2 px-4 sm:gap-4 sm:px-6">
          <div className="flex min-w-0 items-center gap-2 sm:gap-3">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-admissions-accent text-admissions-accent-foreground sm:size-[35px]">
              <Plus aria-hidden="true" className="size-7 stroke-[4]" />
            </span>
            <div className="min-w-0">
              <h1 className="whitespace-nowrap text-[18px] font-bold leading-tight sm:text-[21px]">Patient Admissions</h1>
              <p className="mt-0.5 text-sm text-admissions-muted">Ward register for hospital staff</p>
            </div>
          </div>
          <Button
            onClick={openAddForm}
            className="h-[41px] shrink-0 rounded-md bg-admissions-accent px-4 text-sm font-medium text-admissions-accent-foreground shadow-none hover:bg-admissions-accent-strong"
          >
            <Plus aria-hidden="true" className="size-4" />
            Add patient
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-[1208px] px-4 pb-12 pt-5 sm:px-6">
        <section
          aria-label="Filter patients"
          className="grid gap-3 rounded-md border border-admissions-border bg-admissions-surface p-3.5 md:grid-cols-2 xl:grid-cols-[minmax(220px,2fr)_repeat(4,minmax(125px,1fr))_auto]"
        >
          <div className="min-w-0 xl:min-w-[220px]">
            <Label htmlFor="patient-search" className="mb-1 block text-[13px] font-semibold text-admissions-muted">
              Search by name
            </Label>
            <Input
              id="patient-search"
              value={filters.search}
              onChange={(event) => updateFilters({ search: event.currentTarget.value })}
              placeholder="Type a patient's name..."
              className="h-10 border-admissions-border bg-admissions-surface text-sm shadow-none placeholder:text-admissions-muted/70"
            />
          </div>
          <FilterSelect
            label="Ward"
            value={filters.ward || "all"}
            options={wards}
            onChange={(value) => updateFilters({ ward: value === "all" ? "" : value })}
          />
          <FilterSelect
            label="Department"
            value={filters.department || "all"}
            options={departments}
            onChange={(value) => updateFilters({ department: value === "all" ? "" : value })}
          />
          <FilterSelect
            label="Doctor"
            value={filters.doctor || "all"}
            options={doctors}
            onChange={(value) => updateFilters({ doctor: value === "all" ? "" : value })}
          />
          <FilterSelect
            label="Status"
            value={filters.status || "all"}
            options={statuses}
            onChange={(value) => updateFilters({ status: value === "all" ? "" : value })}
          />
          <div className="flex items-end justify-start md:col-span-2 xl:col-span-1">
            <Button
              type="button"
              variant="ghost"
              onClick={resetFilters}
              className="h-10 px-1.5 text-sm font-normal text-admissions-accent hover:bg-transparent hover:text-admissions-accent-strong"
            >
              Clear filters
            </Button>
          </div>
        </section>

        <section aria-labelledby="patient-list-heading" className="mt-5">
          <div className="mb-2.5 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
            <h2 id="patient-list-heading" className="text-[18px] font-bold leading-6">
              All patients
            </h2>
            <p aria-live="polite" className="text-sm text-admissions-muted">
              {visiblePatients.length} {visiblePatients.length === 1 ? "patient" : "patients"} · {admittedCount} admitted · {dischargedCount} discharged
            </p>
          </div>

          <div className="overflow-hidden rounded-md border border-admissions-border bg-admissions-surface">
            <Table className="min-w-[1080px] table-fixed">
              <TableHeader>
                <TableRow className="h-10 border-admissions-border bg-admissions-table-head hover:bg-admissions-table-head">
                  <TableHead className="w-[158px] px-3 text-[12px] font-bold uppercase tracking-[0.06em] text-admissions-muted">Patient</TableHead>
                  <TableHead className="w-[152px] px-3 text-[12px] font-bold uppercase tracking-[0.06em] text-admissions-muted">Ward</TableHead>
                  <TableHead className="w-[164px] px-3 text-[12px] font-bold uppercase tracking-[0.06em] text-admissions-muted">Department</TableHead>
                  <TableHead className="w-[176px] px-3 text-[12px] font-bold uppercase tracking-[0.06em] text-admissions-muted">Doctor</TableHead>
                  <TableHead className="w-[136px] px-3 text-[12px] font-bold uppercase tracking-[0.06em] text-admissions-muted">Admitted on</TableHead>
                  <TableHead className="w-[112px] px-3 text-[12px] font-bold uppercase tracking-[0.06em] text-admissions-muted">Status</TableHead>
                  <TableHead className="w-[220px] px-3 text-right text-[12px] font-bold uppercase tracking-[0.06em] text-admissions-muted">
                    <span className="sr-only">Actions</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {visiblePatients.map((patient) => (
                  <TableRow key={patient.id} className="h-[67px] border-admissions-border hover:bg-admissions-table-head/60">
                    <TableCell className="px-3 py-2.5">
                      <div className="font-bold leading-5">{patient.name}</div>
                      <div className="mt-0.5 text-[13px] text-admissions-muted">
                        {patient.age} yrs · {patient.gender}
                      </div>
                    </TableCell>
                    <TableCell className="px-3 text-sm">{patient.ward}</TableCell>
                    <TableCell className="px-3 text-sm">{patient.department}</TableCell>
                    <TableCell className="px-3 text-sm">{patient.doctor}</TableCell>
                    <TableCell className="px-3 text-sm tabular-nums">{formatAdmissionDate(patient.admittedOn)}</TableCell>
                    <TableCell className="px-3">
                      <span
                        className={
                          patient.status === "Admitted"
                            ? "inline-flex rounded-full bg-admissions-positive-bg px-2.5 py-1 text-[12px] font-bold leading-none text-admissions-positive-ink"
                            : "inline-flex rounded-full bg-admissions-neutral-bg px-2.5 py-1 text-[12px] font-bold leading-none text-admissions-neutral-ink"
                        }
                      >
                        {patient.status}
                      </span>
                    </TableCell>
                    <TableCell className="px-3">
                      <div className="flex items-center justify-end gap-1.5">
                        {patient.status === "Admitted" && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => dischargePatient(patient.id)}
                            className="border-admissions-border bg-admissions-surface px-2.5 text-[13px] font-normal shadow-none"
                            aria-label={`Discharge ${patient.name}`}
                          >
                            Discharge
                          </Button>
                        )}
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => openEditForm(patient)}
                          className="border-admissions-border bg-admissions-surface px-2.5 text-[13px] font-normal shadow-none"
                          aria-label={`Edit ${patient.name}`}
                        >
                          Edit
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setPatientToDelete(patient)}
                          className="border-admissions-border bg-admissions-surface px-2.5 text-[13px] font-normal text-admissions-danger shadow-none hover:bg-destructive/5 hover:text-admissions-danger"
                          aria-label={`Delete ${patient.name}`}
                        >
                          Delete
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {visiblePatients.length === 0 && (
                  <TableRow className="hover:bg-transparent">
                    <TableCell colSpan={7} className="h-28 px-4 text-center text-sm text-admissions-muted">
                      No patients match these filters.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </section>
      </main>

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto border-admissions-border bg-admissions-surface sm:max-w-[560px]">
          <DialogHeader>
            <DialogTitle>{editingPatient ? "Edit patient" : "Add patient"}</DialogTitle>
            <DialogDescription>
              {editingPatient ? "Update this patient's ward register details." : "Add a patient to the ward register."}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={savePatient} className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="patient-name">Patient name</Label>
                <Input
                  id="patient-name"
                  autoFocus
                  required
                  value={patientForm.name}
                  onChange={(event) => updatePatientForm("name", event.currentTarget.value)}
                  className="border-admissions-border bg-admissions-surface"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="patient-age">Age</Label>
                <Input
                  id="patient-age"
                  type="number"
                  min="0"
                  required
                  value={patientForm.age}
                  onChange={(event) => updatePatientForm("age", event.currentTarget.value)}
                  className="border-admissions-border bg-admissions-surface"
                />
              </div>
              <FormSelect
                label="Gender"
                value={patientForm.gender}
                options={["Female", "Male"]}
                onChange={(value) => updatePatientForm("gender", value as Gender)}
              />
              <FormSelect
                label="Ward"
                value={patientForm.ward}
                options={wards}
                onChange={(value) => updatePatientForm("ward", value)}
              />
              <FormSelect
                label="Department"
                value={patientForm.department}
                options={departments}
                onChange={(value) => updatePatientForm("department", value)}
              />
              <FormSelect
                label="Doctor"
                value={patientForm.doctor}
                options={doctors}
                onChange={(value) => updatePatientForm("doctor", value)}
              />
              <div className="space-y-1.5">
                <Label htmlFor="patient-admitted-on">Admitted on</Label>
                <Input
                  id="patient-admitted-on"
                  type="date"
                  required
                  value={patientForm.admittedOn}
                  onChange={(event) => updatePatientForm("admittedOn", event.currentTarget.value)}
                  className="border-admissions-border bg-admissions-surface"
                />
              </div>
            </div>
            <DialogFooter className="gap-2 sm:gap-2">
              <Button type="button" variant="outline" onClick={() => setFormOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" className="bg-admissions-accent text-admissions-accent-foreground hover:bg-admissions-accent-strong">
                {editingPatient ? "Save changes" : "Add patient"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={patientToDelete !== null} onOpenChange={(open) => !open && setPatientToDelete(null)}>
        <DialogContent className="border-admissions-border bg-admissions-surface sm:max-w-[420px]">
          <DialogHeader>
            <DialogTitle>Delete patient?</DialogTitle>
            <DialogDescription>
              {patientToDelete
                ? `${patientToDelete.name} will be removed from this ward register.`
                : "This patient will be removed from the ward register."}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-2">
            <Button type="button" variant="outline" onClick={() => setPatientToDelete(null)}>
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={deletePatient}
              className="shadow-none"
            >
              Delete patient
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function FilterSelect({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: readonly string[];
  onChange: (value: string) => void;
}) {
  const id = `filter-${label.toLowerCase()}`;
  return (
    <div className="min-w-0">
      <Label htmlFor={id} className="mb-1 block text-[13px] font-semibold text-admissions-muted">
        {label}
      </Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger id={id} className="h-10 border-admissions-border bg-admissions-surface text-sm shadow-none">
          <SelectValue>{value === "all" ? "All" : value}</SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All</SelectItem>
          {options.map((option) => (
            <SelectItem key={option} value={option}>
              {option}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

function FormSelect({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: readonly string[];
  onChange: (value: string) => void;
}) {
  const id = `form-${label.toLowerCase().replaceAll(" ", "-")}`;
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger id={id} className="border-admissions-border bg-admissions-surface">
          <SelectValue>{value}</SelectValue>
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option} value={option}>
              {option}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
