-- DropForeignKey
ALTER TABLE `ObraImage` DROP FOREIGN KEY `ObraImage_obraId_fkey`;

-- DropIndex
DROP INDEX `ObraImage_obraId_fkey` ON `ObraImage`;

-- AddForeignKey
ALTER TABLE `ObraImage` ADD CONSTRAINT `ObraImage_obraId_fkey` FOREIGN KEY (`obraId`) REFERENCES `Obra`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
