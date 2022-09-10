export class ImageSummaryRead {
  imageBaseId: string;
  latestVersionId: string;
  imageName: string;
  osId: any;
  virtId: string;
  createTime: any;
  updateTime: any;
  uploadTime: any;
  expireTime: any;
  ownerId: string;
  uploaderId: string;
  shareMode: any;
  fileSize: string;
  isRestricted: boolean;
  isValid: boolean;
  isProcessed: boolean;
  isTemplate: boolean;
  defaultPermissions: ImagePermissions;
  userPermissions: ImagePermissions;
  fileSizeSum: string;
  versionCount: string;
}

export class ImagePermissions {
  link: boolean;
  download: boolean;
  edit: boolean;
  admin: boolean;
}

export class ImageDetailsRead {

  constructor() {
    this.imageBaseId = '';
    this.latestVersionId =  '';
    this.versions =  [];
    this.imageName =  '';
    this.description =  '';
    this.tags =  [];
    this.osId =  '';
    this.virtId =  '';
    this.createTime =  '';
    this.updateTime =  '';
    this.ownerId =  '';
    this.updaterId =  '';
    this.shareMode =  '';
    this.isTemplate =  false;
    this.defaultPermissions =  {
      link: false,
      download: false,
      edit: false,
      admin: false,
    };
    this.userPermissions =  null;
  }

  imageBaseId: string;
  latestVersionId: string;
  versions: ImageVersionDetails[];
  imageName: string;
  description: string;
  tags: string[];
  osId: any;
  virtId: string;
  createTime: any;
  updateTime: any;
  ownerId: string;
  updaterId: string;
  shareMode: any;
  isTemplate: boolean;
  defaultPermissions: ImagePermissions;
  userPermissions: ImagePermissions;
}

export class ImageVersionDetails {
  versionId: string;
  createTime: any;
  expireTime: any;
  fileSize: string;
  uploaderId: string;
  isRestricted: boolean;
  isValid: boolean;
  isProcessed: boolean;
  software: string[];
}

export class OperatingSystems {
  osId: number;
  osName: string;
  virtualizerOsId: {
    virtualbox: string;
    vmware: string;
  };
  architecture: string;
  maxMemMb: number;
  maxCores: number;
}

export class ImageBaseWrite {

  constructor() {
    this.imageName = '';
    this.description = '';
    this.osId = '';
    this.virtId = '';
    this.isTemplate = false;
    this.shareMode = 0;
    this.defaultPermissions = {
      link: false,
      download: false,
      edit: false,
      admin: false
    };
    this.addTags = null;
    this.remTags = null;
  }

  imageName: string;
  description: string;
  osId: any;
  virtId: string;
  isTemplate: boolean;
  shareMode: any;
  defaultPermissions: ImagePermissions;
  addTags: string[];
  remTags: string[];
}
