// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import { BaseTelemetryData, TelemetryData, ToggleTelemetryData } from '../../common/telemetry-events';
import * as TelemetryEvents from '../../common/telemetry-events';
import { DetailsViewPivotType } from '../../common/types/details-view-pivot-type';
import { ManualTestStatus } from '../../common/types/manual-test-status';
import { VisualizationType } from '../../common/types/visualization-type';
import { ITabStopEvent } from '../../injected/tab-stops-listener';
import { LaunchPanelType } from '../../popup/scripts/components/popup-view';

export interface BaseActionPayload {
    telemetry?: TelemetryData;
}

export interface SelectTestStepPayload extends BaseActionPayload {
    selectedStep: string;
    selectedTest: VisualizationType;
}

export interface UpdateInstanceVisibilityPayload extends ToggleActionPayload {
    selector: string;
    isVisible: boolean;
}

export interface UpdateVisibilityPayload {
    payloadBatch: UpdateInstanceVisibilityPayload[];
}

export interface AssessmentToggleActionPayload extends ToggleActionPayload {
    step: string;
}

export interface AssessmentActionInstancePayload extends AssessmentToggleActionPayload {
    selector: string;
}

export interface ChangeAssessmentStepStatusPayload extends AssessmentToggleActionPayload {
    status?: ManualTestStatus;
}

export interface AddFailureInstancePayload extends AssessmentToggleActionPayload {
    description: string;
}

export interface RemoveFailureInstancePayload extends AssessmentToggleActionPayload {
    id: string;
}

export interface EditFailureInstancePayload extends AddFailureInstancePayload {
    id: string;
}

export interface ChangeInstanceStatusPayload extends AssessmentActionInstancePayload {
    status: ManualTestStatus;
}

export interface ChangeInstanceSelectionPayload extends AssessmentActionInstancePayload {
    isVisualizationEnabled: boolean;
}

export interface UpdateSelectedDetailsViewPayload extends BaseActionPayload {
    detailsViewType: VisualizationType;
    pivotType: DetailsViewPivotType;
}

export interface UpdateSelectedPivot extends BaseActionPayload {
    pivotKey: DetailsViewPivotType;
}

export interface PayloadWithEventName extends BaseActionPayload {
    eventName: string;
}

export interface OnDetailsViewOpenPayload extends UpdateSelectedDetailsViewPayload {
    telemetry: TelemetryEvents.DetailsViewOpenTelemetryData;
}

export interface OnDetailsViewPivotSelected extends BaseActionPayload {
    pivotKey: DetailsViewPivotType;
}

export interface ToggleActionPayload extends BaseActionPayload {
    test: VisualizationType;
}

export interface VisualizationTogglePayload extends ToggleActionPayload {
    enabled: boolean;
    telemetry: ToggleTelemetryData;
}

export interface SwitchToTargetTabPayload extends BaseActionPayload {
    telemetry: BaseTelemetryData;
}

export interface PageVisibilityChangeTabPayload extends BaseActionPayload {
    hidden: boolean;
}

export interface AddTabbedElementPayload extends BaseActionPayload {
    tabbedElements: ITabStopEvent[];
}

export interface SetLaunchPanelState extends BaseActionPayload {
    launchPanelType: LaunchPanelType;
}

export interface OnDevToolOpenPayload extends BaseActionPayload {
    status: boolean;
}

export interface InspectElementPayload extends BaseActionPayload {
    target: string[];
}

export interface InspectFrameUrlPayload extends BaseActionPayload {
    frameUrl: string;
}

export interface SetTelemetryStatePayload extends BaseActionPayload {
    enableTelemetry: boolean;
}

export interface SetHighContrastModePayload extends BaseActionPayload {
    enableHighContrast: boolean;
}

export interface SetBugServicePayload extends BaseActionPayload {
    bugServiceName: string;
}

export interface SetBugServicePropertyPayload extends BaseActionPayload {
    bugServiceName: string;
    propertyName: string;
    propertyValue: string;
}

export interface SetIssueTrackerPathPayload extends BaseActionPayload {
    issueTrackerPath: string;
}
