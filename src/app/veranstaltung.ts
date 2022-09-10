export class LectureSummary {
  lectureId: string;
  lectureName: string;
  imageVersionId: string;
  imageBaseId: string;
  isEnabled: boolean;
  startTime: any;
  endTime: any;
  lastUsed: any;
  useCount: number;
  ownerId: any;
  updaterId: any;
  isExam: boolean;
  hasInternetAccess: boolean;
  defaultPermissions: LecturePermissions;
  userPermissions: LecturePermissions;
  isImageVersionUsable: boolean;
  hasUsbAccess: boolean;
}

export class LectureRead {

  constructor() {
    this.lectureId = '';
    this.lectureName = '';
    this.description = '';
    this.imageVersionId = '';
    this.imageBaseId = '';
    this.autoUpdate = false;
    this.isEnabled = false;
    this.startTime = '';
    this.endTime = '';
    this.lastUsed = '';
    this.useCount = 0;
    this.createTime = '';
    this.updateTime = '';
    this.ownerId = '';
    this.updateTime = '';
    this.runscript = '';
    this.nics = [];
    this.allowedUsers = [];
    this.networkExceptions = [];
    this.isExam = false;
    this.hasInternetAccess = false;
    this.defaultPermissions = new LecturePermissions();
    this.userPermissions = new LecturePermissions();
    this.locationIds = [];
    this.limitToLocations = false;
    this.limitToAllowedUsers = false;
    this.hasUsbAccess = false;
    this.networkShares = [];
    this.ldapFilters = [];
    this.presetScriptIds = 0;
    this.presetNetworkShares = 0;
    this.presetLdapFilters = 0;
    this.presetNetworkExceptionIds = 0;
  }

  lectureId: string;
  lectureName: string;
  description: string;
  imageVersionId: string;
  imageBaseId: string;
  autoUpdate: boolean;
  isEnabled: boolean;
  startTime: any;
  endTime: any;
  lastUsed: any;
  useCount: number;
  createTime: any;
  updateTime: any;
  ownerId: any;
  updaterId: any;
  runscript: string;
  nics: string[];
  allowedUsers: string[];
  networkExceptions: NetRule[];
  isExam: boolean;
  hasInternetAccess: boolean;
  defaultPermissions: LecturePermissions;
  userPermissions: LecturePermissions;
  locationIds: number[];
  limitToLocations: boolean;
  limitToAllowedUsers: boolean;
  hasUsbAccess: boolean;
  networkShares: NetShare[];
  ldapFilters: LdapFilter[];
  presetScriptIds: number;
  presetNetworkShares: number;
  presetLdapFilters: number;
  presetNetworkExceptionIds: number;
}

export class LdapFilter {
  attribute: string;
  value: string;
  filterId: number;
  title: string;
}

export class NetShare {
  auth: string;
  path: string;
  displayname: string;
  mountpoint: string;
  username: string;
  password: string;
  shareId: number;
}

export class NetRule {
  constructor() {
    this.direction = '';
    this.host = '';
    this.port = 0;
  }
  direction: string;
  host: string;
  port: number;
}

export class LecturePermissions {

  constructor() {
    this.edit = false;
    this.admin = false;
  }

  edit: boolean;
  admin: boolean;
}

export class LectureWrite {

  constructor() {
    this.lectureName = null;
    this.description = null;
    this.autoUpdate = null;
    this.imageVersionId = null;
    this.isEnabled = null;
    this.isExam = null;
    this.startTime = null;
    this.endTime = null;
    this.runscript = null;
    this.nics = null;
    this.networkExceptions = null;
    this.hasInternetAccess = null;
    // @ts-ignore
    this.defaultPermissions = { };
    this.defaultPermissions.edit = null;
    this.defaultPermissions.admin = null;
    this.addAllowedUsers = null;
    this.remAllowedUsers = null;
    this.locationIds = null;
    this.limitToAllowedUsers = null;
    this.limitToLocations = null;
    this.hasUsbAccess = null;
    this.hasInternetAccess = null;
    this.networkShares = null;
    this.ldapFilters = null;
    this.presetNetworkExceptionIds = null;
    this.presetScriptIds = null;
  }

  lectureName: string;
  description: string;
  imageVersionId: string;
  autoUpdate: boolean;
  isEnabled: boolean;
  startTime: number;
  endTime: number;
  runscript: string;
  nics: [];
  networkExceptions: [];
  isExam: boolean;
  hasInternetAccess: boolean;
  defaultPermissions: {
    edit: boolean;
    admin: boolean;
  };
  addAllowedUsers: [];
  remAllowedUsers: [];
  locationIds: number[];
  limitToLocations: boolean;
  limitToAllowedUsers: boolean;
  hasUsbAccess: boolean;
  networkShares: [];
  ldapFilters: [];
  presetScriptIds: [];
  presetNetworkExceptionIds: [];
}

export class Location {
  locationId: number;
  locationName: string;
  parentLocationId: number;
}
